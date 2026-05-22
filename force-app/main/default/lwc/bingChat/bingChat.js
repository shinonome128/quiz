import { LightningElement, api, wire } from "lwc";
import { getRecord } from "lightning/uiRecordApi";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import formFactor from "@salesforce/client/formFactor";

export default class BingChat extends LightningElement {
	@api
	recordId;

	@wire(getRecord, {
		recordId: "$recordId",
		fields: [
			"Question__c.Question__c",
			"Question__c.A__c",
			"Question__c.B__c",
			"Question__c.C__c",
			"Question__c.D__c",
			"Question__c.E__c"
		]
	})
	wiredRecord;

	async handleClick() {
		switch (formFactor) {
			case "Large":
				await this.shareClipBoard();
				await this.notifyToast();
				this.openBingChatPage();
				this.openGooleAiModePage();
				this.openGeminiPage();
				break;
			case "Medium":
				await this.shareClipBoard();
				await this.notifyToast();
				this.openBingChatPage();
				this.openGooleAiModePage();
				this.openGeminiPage();
				break;
			case "Small":
				await this.shareClipBoard();
				await this.notifyToast();
				break;
			default:
				break;
		}
	}

	openBingChatPage() {
		window.open(
			"https://www.bing.com/search?q=" +
				encodeURIComponent(this.createQuery()) +
				"&showconv=0",
			"_blank"
		);
	}

	openGooleAiModePage() {
		window.open(
			"https://www.google.co.jp/search?q=" +
				encodeURIComponent(this.createQuery()) +
				"&udm=50",
			"_blank"
		);
	}

	openGeminiPage() {
		window.open("https://gemini.google.com/app", "_blank");
	}

	createQuery() {
		return this.createPrompt() + this.createQuestion();
	}

	createPrompt() {
		return (
			"下記の問題でもっとも最適な選択肢を1つだけ教えてください。\n" +
			"合わせてその理由を日本語で教えてください。\n" +
			"特に問題文に指定が無い限り選択肢は一つだけです。\n"
		);
	}

	createQuestion() {
		let question =
			"\n(Qustion): " + this.wiredRecord.data.fields.Question__c.value;
		if (this.wiredRecord.data.fields.A__c.value) {
			question += "\n(A): " + this.wiredRecord.data.fields.A__c.value;
		}
		if (this.wiredRecord.data.fields.B__c.value) {
			question += "\n(B): " + this.wiredRecord.data.fields.B__c.value;
		}
		if (this.wiredRecord.data.fields.C__c.value) {
			question += "\n(C): " + this.wiredRecord.data.fields.C__c.value;
		}
		if (this.wiredRecord.data.fields.D__c.value) {
			question += "\n(D): " + this.wiredRecord.data.fields.D__c.value;
		}
		if (this.wiredRecord.data.fields.E__c.value) {
			question += "\n(E): " + this.wiredRecord.data.fields.E__c.value;
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

	async shareClipBoard() {
		const textArea = document.createElement("textarea");
		textArea.value = this.createQuery();
		document.body.appendChild(textArea);
		textArea.select();
		document.execCommand("copy");
		document.body.removeChild(textArea);
	}

	async notifyToast() {
		this.dispatchEvent(
			new ShowToastEvent({
				title: "クリップボードにプロンプトをコピーしました",
				message: "AIプリに投稿してください",
				variant: "success"
			})
		);
		await this.sleep(3000);
	}

	sleep(ms) {
		// eslint-disable-next-line @lwc/lwc/no-async-operation
		return new Promise((resolve) => setTimeout(resolve, ms));
	}
}