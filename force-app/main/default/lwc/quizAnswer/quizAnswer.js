import { LightningElement, wire } from "lwc";
import { MessageContext, publish, subscribe } from "lightning/messageService";
import { CurrentPageReference } from "lightning/navigation";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import { getRecord, createRecord } from "lightning/uiRecordApi";
import formFactor from "@salesforce/client/formFactor";
import quizSelected from "@salesforce/messageChannel/QuizSelected__c";
import quizAnswered from "@salesforce/messageChannel/QuizAnswered__c";
import getRecordCount from "@salesforce/apex/QuizDataService.getRecordCount";
import checkAlreadyAnswered from "@salesforce/apex/QuizDataService.checkAlreadyAnswered";

export default class QuizAnswer extends LightningElement {
	recordId;
	localId;
	type;
	selection;
	question;
	aFieldShow;
	bFieldShow;
	cFieldShow;
	dFieldShow;
	eFieldShow;
	fFieldShow;
	subscription;
	progressMessage;
	fields = [
		"Question__c.Id",
		"Question__c.Answer__c",
		"Question__c.A__c",
		"Question__c.B__c",
		"Question__c.C__c",
		"Question__c.D__c",
		"Question__c.E__c",
		"Question__c.F__c"
	];
	defaultTimer = 300;
	timeLeft = this.defaultTimer;
	timerInterval;

	@wire(MessageContext)
	messageContext;

	@wire(CurrentPageReference)
	getPageReference(pageRef) {
		if (pageRef) {
			this.type = pageRef.state.type;
		}
	}

	@wire(getRecord, { recordId: "$recordId", fields: "$fields" })
	record({ data, error }) {
		if (data) {
			this.question = data;
			this.aFieldShow = !data.fields.A__c.value ? false : true;
			this.bFieldShow = !data.fields.B__c.value ? false : true;
			this.cFieldShow = !data.fields.C__c.value ? false : true;
			this.dFieldShow = !data.fields.D__c.value ? false : true;
			this.eFieldShow = !data.fields.E__c.value ? false : true;
			this.fFieldShow = !data.fields.F__c.value ? false : true;
		} else if (error) {
			console.error(error);
		}
	}

	get formattedTime() {
		const minutes = Math.floor(this.timeLeft / 60);
		const seconds = this.timeLeft % 60;
		return `${minutes}:${seconds.toString().padStart(2, "0")}`;
	}

	connectedCallback() {
		this.subscription = subscribe(
			this.messageContext,
			quizSelected,
			(message) => this.handleSelected(message)
		);
	}

	handleSelected(message) {
		this.recordId = message.recordId;
		this.selection = "";
		this.template
			.querySelectorAll("lightning-input")
			.forEach((element) => (element.checked = false));
		this.startTimer();
	}

	startTimer() {
		this.stopTimer();
		this.timeLeft = this.defaultTimer;
		// eslint-disable-next-line @lwc/lwc/no-async-operation
		this.timerInterval = setInterval(() => {
			this.timeLeft--;
			if (this.timeLeft <= 0) {
				this.stopTimer();
				this.getAnswer();
			}
		}, 1000);
	}

	stopTimer() {
		if (this.timerInterval) {
			clearInterval(this.timerInterval);
		}
	}

	async getAnswer() {
		this.stopTimer();
		if (formFactor === "Small") {
			this.notifyProgress();
		}
		if (!this.question) return;
		const isSuccess = this.createIsSuccess();
		const alreadyAnswered = await this.checkAlreadyAnswered();
		if (!alreadyAnswered) {
			this.createResult(isSuccess);
		}
		this.notifyResult(isSuccess);
		if (isSuccess) {
			this.scatterConfetti();
		}
		this.publishResult();
	}

	createIsSuccess() {
		return this.selection === this.question.fields.Answer__c.value
			? true
			: false;
	}

	async checkAlreadyAnswered() {
		return checkAlreadyAnswered({
			jsonParams: JSON.stringify({
				questionId: this.question.fields.Id.value,
				localId: this.localId
			})
		});
	}

	createResult(isSuccess) {
		const recordInput = {
			apiName: "QuestionResult__c",
			fields: {
				QuestionId__c: this.question.fields.Id.value,
				IsSuccess__c: isSuccess,
				Result__c: this.selection,
				LocalId__c: this.localId
			}
		};
		createRecord(recordInput);
	}

	notifyResult(isSuccess) {
		const evt = new ShowToastEvent({
			title: isSuccess === true ? "Correct" : "Incorrect",
			message: "Anser is " + this.question.fields.Answer__c.value + ".",
			variant: isSuccess === true ? "success" : "warning"
		});
		this.dispatchEvent(evt);
	}

	scatterConfetti() {
		this.template.querySelector("c-confetti").scatterConfetti();
	}

	async notifyProgress() {
		const evt = new ShowToastEvent({
			title: "Progress",
			message: await this.createMessage()
		});
		this.dispatchEvent(evt);
	}

	async createMessage() {
		const jsonParams = {
			localId: this.localId,
			type: this.type
		};
		await getRecordCount({
			jsonParams: JSON.stringify(jsonParams),
			randomParam: new Date().getTime()
		})
			.then((result) => {
				const i = parseInt(JSON.parse(result), 10) + 1;
				this.progressMessage = "You completed " + i + " questions!";
			})
			.catch((error) => {
				console.error(error);
			});
		return this.progressMessage;
	}

	publishResult() {
		window.clearTimeout(this.delayTimeout);
		// eslint-disable-next-line @lwc/lwc/no-async-operation
		this.delayTimeout = setTimeout(() => {
			publish(this.messageContext, quizAnswered, {
				recordId: this.recordId
			});
		}, 3000);
	}

	handleNotify(event) {
		this.localId = event.detail;
	}

	handleCheckboxChange() {
		const checked = Array.from(
			this.template.querySelectorAll("lightning-input")
		)
			.filter((element) => element.checked)
			.map((element) => element.label);
		this.selection = checked.join(",");
	}

	disconnectedCallback() {
		this.stopTimer();
	}
}