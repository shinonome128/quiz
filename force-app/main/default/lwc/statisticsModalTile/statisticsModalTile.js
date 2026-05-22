import { LightningElement, api, wire } from "lwc";
import getQuestions from "@salesforce/apex/QuizDataService.getQuestionsByIds";

export default class StatisticsModalTile extends LightningElement {
	questions;

	@api
	title;

	@api
	statistics;

	@wire(getQuestions, {
		jsonParams: "$jsonParams",
		randomParam: new Date().getTime()
	})
	wiredQuestions({ data, error }) {
		if (data) {
			this.createQuestions(data);
		} else if (error) {
			console.error(error);
		}
	}

	get length() {
		return this.title === "Success"
			? this.statistics.success.length
			: this.statistics.fail.length;
	}

	get jsonParams() {
		return JSON.stringify({
			ids:
				this.title === "Success"
					? this.statistics.success
					: this.statistics.fail
		});
	}

	handleClick(event) {
		window.open("/" + event.target.dataset.index, "_blank");
	}

	createQuestions(data) {
		this.questions = JSON.parse(data);
	}
}