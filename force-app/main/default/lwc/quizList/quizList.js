import { LightningElement, wire } from "lwc";
import { MessageContext, publish, subscribe } from "lightning/messageService";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import formFactor from "@salesforce/client/formFactor";
import quizFiltered from "@salesforce/messageChannel/QuizFiltered__c";
import quizSelected from "@salesforce/messageChannel/QuizSelected__c";
import getQuestions from "@salesforce/apex/QuizDataService.getQuestions";

export default class QuizList extends LightningElement {
	subscription;
	jsonParams;
	randomParam;
	questions;
	_questions;
	pageNumber = 1;
	pageSize = 10;
	totalItemCount;

	get tileClass() {
		let tileClass;
		switch (formFactor) {
			case "Large":
				tileClass = "slds-var-p-around_xxx-small slds-size_1-of-5";
				break;
			case "Medium":
			case "Small":
				tileClass = "slds-var-p-around_xxx-small slds-size_1-of-2";
				break;
			default:
				break;
		}
		return tileClass;
	}

	@wire(MessageContext)
	messageContext;

	@wire(getQuestions, {
		jsonParams: "$jsonParams",
		randomParam: "$randomParam"
	})
	wiredQuestions({ data, error }) {
		if (data) {
			this._questions = data;
			this.totalItemCount = JSON.parse(data).length;
			this.createQuestions(data);
			this.notifyItemCount();
		} else if (error) {
			console.error(error);
		}
	}

	connectedCallback() {
		this.subscription = subscribe(
			this.messageContext,
			quizFiltered,
			(message) => {
				this.createParams(message);
			}
		);
	}

	handleNotify(event) {
		this.localId = event.detail;
	}

	handleQuestionSelected(event) {
		this.changeTileColor(event);
		publish(this.messageContext, quizSelected, {
			recordId: event.detail.Id
		});
	}

	handlePreviousPage() {
		this.pageNumber = this.pageNumber - 1;
		this.createQuestions(this._questions);
	}

	handleNextPage() {
		this.pageNumber = this.pageNumber + 1;
		this.createQuestions(this._questions);
	}

	createParams(message) {
		const params = {
			localId: this.localId,
			numberOfFail: message.filters.numberOfFail,
			numberOfFailToggle: message.filters.numberOfFailToggle,
			numberOfSuccess: message.filters.numberOfSuccess,
			numberOfSuccessToggle: message.filters.numberOfSuccessToggle,
			numberOfDays: message.filters.numberOfDays,
			numberOfDaysToggle: message.filters.numberOfDaysToggle,
			isLastFailedToggle: message.filters.isLastFailedToggle,
			type: message.filters.type
		};
		this.jsonParams = JSON.stringify(params);
		this.randomParam = new Date().getTime();
	}

	createQuestions(data) {
		const start = (this.pageNumber - 1) * this.pageSize;
		const end = this.pageNumber * this.pageSize;
		this.questions = JSON.parse(data).slice(start, end);
	}

	changeTileColor(event) {
		this.template.querySelectorAll("c-quiz-tile").forEach((item) => {
			item.isSelected =
				item.question.Name === event.detail.Name ? true : false;
		});
	}

	notifyItemCount() {
		if (formFactor !== "Small") {
			return;
		}
		this.dispatchEvent(
			new ShowToastEvent({
				title: "Query Result",
				message: this.totalItemCount + " items found."
			})
		);
	}
}