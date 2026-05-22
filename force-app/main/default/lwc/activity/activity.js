import { LightningElement, api, wire } from "lwc";
import { NavigationMixin } from "lightning/navigation";
import { MessageContext, subscribe } from "lightning/messageService";
import icons from "@salesforce/resourceUrl/icons";
import getActivities from "@salesforce/apex/QuizDataService.getActivities";
import quizSelected from "@salesforce/messageChannel/QuizSelected__c";
import quizAnswered from "@salesforce/messageChannel/QuizAnswered__c";

export default class Activity extends NavigationMixin(LightningElement) {
	activities;
	selectedSubscription;
	answeredSubscription;
	localId;

	@api
	recordId;

	@wire(MessageContext)
	messageContext;

	get svgSwitch() {
		return icons + "/utility-sprite/svg/symbols.svg#switch";
	}

	connectedCallback() {
		if (this.recordId) {
			return;
		}
		this.selectedSubscription = subscribe(
			this.messageContext,
			quizSelected,
			(message) => this.getActivities(message.recordId)
		);
		this.answeredSubscription = subscribe(
			this.messageContext,
			quizAnswered,
			(message) => this.getActivities(message.recordId)
		);
	}

	handleClickName(event) {
		if (window.location.origin.match(/lightning.force.com/)) {
			this.moveToRecordPage(event);
		} else {
			this.openRecordPage(event);
		}
	}

	handleClickSwitch(event) {
		this.activities = this.activities.map((e) => {
			const t = e;
			if (
				e.id === event.target.dataset.index &&
				t.timeline.includes("slds-is-open")
			) {
				t.timeline = e.timeline.replace("slds-is-open", "");
			} else if (
				e.id === event.target.dataset.index &&
				!t.timeline.includes("slds-is-open")
			) {
				t.timeline = e.timeline + " slds-is-open";
			}
			return t;
		});
	}

	handleNotify(event) {
		this.localId = event.detail;
		this.getActivities(this.recordId);
	}

	async getActivities(recordId) {
		const jsonParams = {
			recordId: recordId,
			localId: this.localId
		};
		await getActivities({
			jsonParams: JSON.stringify(jsonParams),
			randomParam: new Date().getTime()
		})
			.then((result) => {
				this.createActivities(result);
			})
			.catch((error) => {
				console.error(error);
			});
	}

	moveToRecordPage(event) {
		this[NavigationMixin.Navigate]({
			type: "standard__recordPage",
			attributes: {
				recordId: event.target.dataset.index,
				actionName: "view"
			}
		});
	}

	openRecordPage(event) {
		window.open("/" + event.target.dataset.index, "_blank");
	}

	createActivities(result) {
		if (result === "[]") {
			this.activities = undefined;
			return;
		}
		this.activities = JSON.parse(result).map((e) => {
			const t = {};
			t.id = e.Id;
			t.name = this.createName(e.IsSuccess__c);
			t.detail = e.Result__c;
			t.date = e.CreatedDate;
			t.timeline = this.createTimeline(e.IsSuccess__c);
			t.icon = this.createIcon(e.IsSuccess__c);
			t.svg = this.createSvg(e.IsSuccess__c);
			return t;
		});
	}

	createName(isSuccess) {
		return isSuccess === true ? "Success" : "Fail";
	}

	createTimeline(isSuccess) {
		return isSuccess === true
			? "slds-timeline__item_expandable slds-timeline__item_task"
			: "slds-timeline__item_expandable slds-timeline__item_event";
	}

	createIcon(isSuccess) {
		return isSuccess === true
			? "slds-icon_container slds-icon-standard-task slds-timeline__icon"
			: "slds-icon_container slds-icon-standard-event slds-timeline__icon";
	}

	createSvg(isSuccess) {
		return isSuccess === true
			? icons + "/standard-sprite/svg/symbols.svg#task"
			: icons + "/standard-sprite/svg/symbols.svg#event";
	}
}