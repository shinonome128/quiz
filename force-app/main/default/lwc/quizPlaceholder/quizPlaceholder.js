import { LightningElement, api } from "lwc";

export default class QuizPlaceholder extends LightningElement {
	@api message;
	logoUrl = "https://freesvg.org/img/Eagle9Silhouette.png";
}