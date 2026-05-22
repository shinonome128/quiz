import { LightningElement, api } from "lwc";

export default class StatisticsTile extends LightningElement {
	@api
	span;

	@api
	answers;

	@api
	accuracy;

	get accuracyClass() {
		if (this.accuracy >= 90) {
			return "slds-text-color_success";
		}
		if (this.accuracy >= 75) {
			return "slds-text-color_warning";
		}
		return "slds-text-color_error";
	}
}