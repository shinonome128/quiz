import { LightningElement } from "lwc";
import isSingleMode from "@salesforce/label/c.isSingleMode";

export default class SessionCheck extends LightningElement {
	sessionId;
	localId;

	connectedCallback() {
		this.checkSession();
		this.checkLocal();
	}

	checkSession() {
		const storedSessionId = sessionStorage.getItem("session_id");
		if (!storedSessionId) {
			const newSessionId = this.generateSessionId();
			sessionStorage.setItem("session_id", newSessionId);
			this.sessionId = newSessionId;
		} else {
			this.sessionId = storedSessionId;
		}
	}

	generateSessionId() {
		return "session_" + Date.now();
	}

	checkLocal() {
		const storedLocalId = localStorage.getItem("local_id");
		if (!storedLocalId) {
			const newLocalId = this.generateLocalId();
			localStorage.setItem("local_id", newLocalId);
			this.localId = newLocalId;
		} else {
			this.localId = storedLocalId;
		}
		this.notifyLocalId();
	}

	generateLocalId() {
		return "local_" + Date.now();
	}

	notifyLocalId() {
		const localId = isSingleMode === "true" ? "single" : this.localId;
		this.dispatchEvent(
			new CustomEvent("notify", {
				detail: localId
			})
		);
	}
}