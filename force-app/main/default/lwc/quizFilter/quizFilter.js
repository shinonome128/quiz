import { LightningElement, wire } from "lwc";
import { MessageContext, publish } from "lightning/messageService";
import { CurrentPageReference } from "lightning/navigation";
import quizFiltered from "@salesforce/messageChannel/QuizFiltered__c";

export default class QuizFilter extends LightningElement {
	filters;
	numberOfFailToggle = true;
	numberOfFail = 0;
	numberOfSuccessToggle = true;
	numberOfSuccess = 0;
	numberOfDaysToggle = false;
	numberOfDays = 30;
	isLastFailedToggle = false;
	type;

	@wire(MessageContext)
	messageContext;

	@wire(CurrentPageReference)
	getPageReference(pageRef) {
		if (pageRef) {
			this.type = pageRef.state.type;
		}
		this.createFilters();
		this.publishFilterChangeEvent();
	}

	createFilters() {
		this.filters = {
			numberOfFail: this.numberOfFail,
			numberOfSuccess: this.numberOfSuccess,
			numberOfFailToggle: this.numberOfFailToggle,
			numberOfSuccessToggle: this.numberOfSuccessToggle,
			numberOfDaysToggle: this.numberOfDaysToggle,
			numberOfDays: this.numberOfDays,
			isLastFailedToggle: this.isLastFailedToggle,
			type: this.type
		};
	}

	handleFilterChange(event) {
		if (event.target.name.includes("Toggle")) {
			this.filters[event.target.name] = event.detail.checked
				? true
				: false;
		} else {
			this.filters[event.target.name] = event.target.value;
		}
		this.publishFilterChangeEvent();
	}

	publishFilterChangeEvent() {
		publish(this.messageContext, quizFiltered, {
			filters: this.filters
		});
	}
}