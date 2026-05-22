import { LightningElement, wire } from "lwc";
import { MessageContext, subscribe } from "lightning/messageService";
import { CurrentPageReference } from "lightning/navigation";
import quizAnswered from "@salesforce/messageChannel/QuizAnswered__c";
import getStatistics from "@salesforce/apex/QuizDataService.getStatistics";
import getTotal from "@salesforce/apex/QuizDataService.getTotal";
import statisticsModal from "c/statisticsModal";

export default class Statistics extends LightningElement {
	localId;
	type;
	answeredSubscription;
	answersToday;
	answersWeek;
	answersMonth;
	answersAll;
	accuracyToday;
	accuracyWeek;
	accuracyMonth;
	accuracyAll;
	statisticsToday;
	statisticsWeek;
	statisticsMonth;
	statisticsAll;
	randomParam;
	jsonParamsToday;
	jsonParamsWeek;
	jsonParamsMonth;
	jsonParamsAll;
	jsonParamsTotal;
	title;

	@wire(MessageContext)
	messageContext;

	@wire(CurrentPageReference)
	getPageReference(pageRef) {
		if (pageRef) {
			this.type = pageRef.state.type;
		}
	}

	@wire(getStatistics, {
		jsonParams: "$jsonParamsToday",
		randomParam: "$randomParam"
	})
	wiredStatisticsToday({ data, error }) {
		if (data) {
			this.answersToday = this.createAnswers(data);
			this.accuracyToday = this.createAccuracy(data);
			this.statisticsToday = this.createStatistics(data);
		} else if (error) {
			console.error(error);
		}
	}

	@wire(getStatistics, {
		jsonParams: "$jsonParamsWeek",
		randomParam: "$randomParam"
	})
	wiredStatisticsWeek({ data, error }) {
		if (data) {
			this.answersWeek = this.createAnswers(data);
			this.accuracyWeek = this.createAccuracy(data);
			this.statisticsWeek = this.createStatistics(data);
		} else if (error) {
			console.error(error);
		}
	}

	@wire(getStatistics, {
		jsonParams: "$jsonParamsMonth",
		randomParam: "$randomParam"
	})
	wiredStatisticsMonth({ data, error }) {
		if (data) {
			this.answersMonth = this.createAnswers(data);
			this.accuracyMonth = this.createAccuracy(data);
			this.statisticsMonth = this.createStatistics(data);
		} else if (error) {
			console.error(error);
		}
	}

	@wire(getStatistics, {
		jsonParams: "$jsonParamsAll",
		randomParam: "$randomParam"
	})
	wiredStatisticsAll({ data, error }) {
		if (data) {
			this.answersAll = this.createAnswers(data);
			this.accuracyAll = this.createAccuracy(data);
			this.statisticsAll = this.createStatistics(data);
		} else if (error) {
			console.error(error);
		}
	}

	@wire(getTotal, {
		jsonParams: "$jsonParamsTotal",
		randomParam: "$randomParam"
	})
	wiredTotal({ data, error }) {
		if (data) {
			this.title =
				"Total number of questions is " + JSON.parse(data) + ".";
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

	async handleClick(event) {
		let label;
		let statistics;
		switch (event.target.name) {
			case "today":
				label = "Today";
				statistics = this.statisticsToday;
				break;
			case "week":
				label = "Week";
				statistics = this.statisticsWeek;
				break;
			case "month":
				label = "Month";
				statistics = this.statisticsMonth;
				break;
			case "all":
				label = "All";
				statistics = this.statisticsAll;
				break;
			default:
				break;
		}
		await statisticsModal.open({
			size: "small",
			label: label,
			statistics: statistics
		});
	}

	createParams() {
		this.randomParam = new Date().getTime();
		this.jsonParamsToday = JSON.stringify({
			localId: this.localId,
			type: this.type,
			span: "TODAY"
		});
		this.jsonParamsWeek = JSON.stringify({
			localId: this.localId,
			type: this.type,
			span: "LAST_N_DAYS:7"
		});
		this.jsonParamsMonth = JSON.stringify({
			localId: this.localId,
			type: this.type,
			span: "LAST_N_DAYS:30"
		});
		this.jsonParamsAll = JSON.stringify({
			localId: this.localId,
			type: this.type,
			span: "LAST_N_DAYS:365"
		});
		this.jsonParamsTotal = JSON.stringify({
			type: this.type
		});
	}

	createAnswers(data) {
		return JSON.parse(data).success.length + JSON.parse(data).fail.length;
	}

	createAccuracy(data) {
		if (JSON.parse(data).success.length === 0) {
			return 0;
		}
		return (
			(JSON.parse(data).success.length * 100) /
			(JSON.parse(data).success.length + JSON.parse(data).fail.length)
		).toFixed(2);
	}

	createStatistics(data) {
		return JSON.parse(data);
	}
}