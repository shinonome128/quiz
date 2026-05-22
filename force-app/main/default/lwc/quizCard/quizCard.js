import { LightningElement, wire } from "lwc";
import { MessageContext, subscribe } from "lightning/messageService";
import { NavigationMixin } from "lightning/navigation";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import quizSelected from "@salesforce/messageChannel/QuizSelected__c";
import formFactor from "@salesforce/client/formFactor";

export default class QuizCard extends NavigationMixin(LightningElement) {
	questionFieldShow = true;
	aFieldShow = true;
	bFieldShow = true;
	cFieldShow = true;
	dFieldShow = true;
	eFieldShow = true;
	fFieldShow = true;
	recordId;
	recordData;
	name;
	subscription;

	@wire(MessageContext)
	messageContext;

	connectedCallback() {
		this.subscription = subscribe(
			this.messageContext,
			quizSelected,
			(message) => this.setRecordId(message)
		);
	}

	setRecordId(message) {
		this.recordId = message.recordId;
	}

	handleRecordLoaded(event) {
		this.recordData = event.detail.records[this.recordId];
		this.name = this.recordData.fields.Name.value;
		this.questionFieldShow = this.recordData.fields.Question__c.value
			? true
			: false;
		this.aFieldShow = this.recordData.fields.A__c.value ? true : false;
		this.bFieldShow = this.recordData.fields.B__c.value ? true : false;
		this.cFieldShow = this.recordData.fields.C__c.value ? true : false;
		this.dFieldShow = this.recordData.fields.D__c.value ? true : false;
		this.eFieldShow = this.recordData.fields.E__c.value ? true : false;
		this.fFieldShow = this.recordData.fields.F__c.value ? true : false;
	}

	handleNavigateToRecordClick() {
		if (window.location.origin.match(/lightning.force.com/)) {
			this.moveToRecordPage();
		} else {
			this.openRecordPage();
		}
	}

	handleTranslationClick() {
		switch (formFactor) {
			case "Large":
				this.openTranslatePage();
				break;
			case "Medium":
				this.openTranslatePage();
				break;
			case "Small":
				this.shareClipBoard();
				this.notifyToast();
				break;
			default:
				break;
		}
	}

	moveToRecordPage() {
		this[NavigationMixin.Navigate]({
			type: "standard__recordPage",
			attributes: {
				recordId: this.recordId,
				objectApiName: "Question__c",
				actionName: "view"
			}
		});
	}

	openRecordPage() {
		window.open("/" + this.recordId, "_blank");
	}

	handleConfettiClick() {
		this.template.querySelector("c-confetti").scatterConfetti();
	}

	openTranslatePage() {
		window.open(
			"https://www.deepl.com/translator#en/ja/" +
				encodeURIComponent(this.createQuestion()),
			"_blank"
		);
	}

	shareClipBoard() {
		const textArea = document.createElement("textarea");
		textArea.value = this.createQuestion();
		document.body.appendChild(textArea);
		textArea.select();
		document.execCommand("copy");
		document.body.removeChild(textArea);
	}

	createQuestion() {
		let question =
			"\n(Qustion): " + this.recordData.fields.Question__c.value;
		if (this.recordData.fields.A__c.value) {
			question += "\n(A): " + this.recordData.fields.A__c.value;
		}
		if (this.recordData.fields.B__c.value) {
			question += "\n(B): " + this.recordData.fields.B__c.value;
		}
		if (this.recordData.fields.C__c.value) {
			question += "\n(C): " + this.recordData.fields.C__c.value;
		}
		if (this.recordData.fields.D__c.value) {
			question += "\n(D): " + this.recordData.fields.D__c.value;
		}
		if (this.recordData.fields.E__c.value) {
			question += "\n(E): " + this.recordData.fields.E__c.value;
		}
		return this.replaceHtmlEntity(this.removeTags(question));
	}

	removeTags(str) {
		return str.replace(/<[^>]+>/gi, "");
	}

	replaceHtmlEntity(str) {
		return str
			.replace(/&gt;/g, ">")
			.replace(/&lt;/g, "<")
			.replace(/&quot;/g, '"')
			.replace(/&#39;/g, "'")
			.replace(/\//g, "／")
			.replace(/\|/g, "｜");
	}

	notifyToast() {
		this.dispatchEvent(
			new ShowToastEvent({
				title: "クリップボードにコピーしました",
				message: "翻訳アプリに貼り付けてください",
				variant: "success"
			})
		);
	}
}