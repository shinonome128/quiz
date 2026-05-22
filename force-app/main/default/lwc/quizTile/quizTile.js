import { LightningElement, api } from "lwc";

export default class QuizTile extends LightningElement {
	@api
	question;

	@api
	isSelected;

	get name() {
		return this.question.Name;
	}

	get card() {
		return this.isSelected === true ? "selected-card" : "default-card";
	}

	handleClick() {
		const selectedEvent = new CustomEvent("selected", {
			detail: this.question
		});
		this.dispatchEvent(selectedEvent);
	}
}