import { api } from "lwc";
import LightningModal from "lightning/modal";

export default class StatisticsModal extends LightningModal {
	@api
	label;

	@api
	statistics;
}