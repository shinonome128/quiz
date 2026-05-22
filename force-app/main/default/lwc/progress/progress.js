import { LightningElement, wire } from "lwc";
import { MessageContext, subscribe } from "lightning/messageService";
import { CurrentPageReference } from "lightning/navigation";
import quizAnswered from "@salesforce/messageChannel/QuizAnswered__c";
import getProgress from "@salesforce/apex/QuizDataService.getProgress";

export default class Progress extends LightningElement {
	localId;
	type;
	answeredSubscription;
	chart;
	date;
	success;
	fail;
	randomParam;
	jsonParams;

	@wire(MessageContext)
	messageContext;

	@wire(CurrentPageReference)
	getPageReference(pageRef) {
		if (pageRef) {
			this.type = pageRef.state.type;
		}
	}

	@wire(getProgress, {
		jsonParams: "$jsonParams",
		randomParam: "$randomParam"
	})
	wiredProgress({ data, error }) {
		if (data) {
			this.createData(data);
			this.createChart();
		} else if (error) {
			console.error(error);
		}
	}

	connectedCallback() {
		this.answeredSubscription = subscribe(
			this.messageContext,
			quizAnswered,
			() => this.createParams()
		);
	}

	handleNotify(event) {
		this.localId = event.detail;
		this.createParams();
	}

	createData(data) {
		let date = [];
		let success = [];
		let fail = [];
		JSON.parse(data).forEach((item) => {
			if (!date.includes(item.expr0)) {
				date.push(item.expr0);
				success.push(0);
				fail.push(0);
			}
			const index = date.indexOf(item.expr0);
			if (item.IsSuccess__c) {
				success[index] += item.expr1;
			} else {
				fail[index] += item.expr1;
			}
		});
		this.date = date;
		this.success = success;
		this.fail = fail;
	}

	createChart() {
		Promise.all([this.loadScript("https://cdn.jsdelivr.net/npm/chart.js")])
			.then(() => {
				this.initializeChart();
			})
			.catch((error) => {
				console.error(error);
			});
	}

	loadScript(url) {
		return new Promise((resolve, reject) => {
			const script = document.createElement("script");
			script.src = url;
			script.onload = resolve;
			script.onerror = reject;
			document.head.appendChild(script);
		});
	}

	initializeChart() {
		const ctx = this.template.querySelector("canvas").getContext("2d");
		// eslint-disable-next-line no-undef
		this.chart = new Chart(ctx, {
			type: "bar",
			data: {
				labels: this.date,
				datasets: [
					{
						label: "Success",
						data: this.success,
						backgroundColor: "rgba(75, 192, 192, 0.2)",
						borderColor: "rgba(75, 192, 192, 1)",
						borderWidth: 1
					},
					{
						label: "Fail",
						data: this.fail,
						backgroundColor: "rgba(7, 19, 19, 0.2)",
						borderColor: "rgba(7, 19, 19, 1)",
						borderWidth: 1
					}
				]
			},
			options: {
				scales: {
					x: {
						stacked: true
					},
					y: {
						stacked: true,
						beginAtZero: true
					}
				}
			}
		});
	}

	createParams() {
		this.randomParam = new Date().getTime();
		this.jsonParams = JSON.stringify({
			localId: this.localId,
			type: this.type
		});
	}
}