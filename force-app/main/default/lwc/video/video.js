import { LightningElement, api } from "lwc";
import { NavigationMixin } from "lightning/navigation";

export default class Video extends NavigationMixin(LightningElement) {
	quizNavigated;

	@api
	url;

	@api
	type;

	@api
	zIndex;

	@api
	isActive;

	@api
	isLoaded;

	@api
	isFirst;

	@api
	isLast;

	connectedCallback() {
		this.loadGsap();
		this.boundKeydownHandler = this.handleKeydown.bind(this);
		document.addEventListener("keydown", this.boundKeydownHandler);
	}

	disconnectedCallback() {
		if (this.boundKeydownHandler) {
			document.removeEventListener("keydown", this.boundKeydownHandler);
		}
	}

	loadGsap() {
		Promise.all([
			this.loadScript(
				"https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js"
			)
		])
			.then(() => {
				this.moveTitle();
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

	moveTitle() {
		if (!this.isFirst) {
			return;
		}
		this.moveChar(".c1");
		this.moveChar(".c2");
		this.moveChar(".c3");
		this.moveChar(".c4");
		this.moveChar(".type");
	}

	moveChar(clazz) {
		// eslint-disable-next-line no-undef
		gsap.fromTo(
			this.template.querySelector(clazz),
			{
				opacity: 0,
				x: this.createRandomPoint(),
				y: this.createRandomPoint()
			},
			{
				opacity: 1,
				x: 0,
				y: 0,
				duration: 1,
				ease: "elastic.inOut",
				delay: this.createRandomDelay()
			}
		);
	}

	createRandomDelay() {
		const min = Math.ceil(0);
		const max = Math.floor(1);
		return Math.floor(Math.random() * (max - min + 1)) + min;
	}

	createRandomPoint() {
		const min = Math.ceil(-1000);
		const max = Math.floor(1000);
		return Math.floor(Math.random() * (max - min + 1)) + min;
	}

	handleKeydown(event) {
		window.clearTimeout(this.delayTimeout);
		// eslint-disable-next-line @lwc/lwc/no-async-operation
		this.delayTimeout = setTimeout(() => {
			this.delayKeydown(event);
		}, 500);
	}

	async delayKeydown(event) {
		if (await this.isInvalidScreen()) {
			return;
		}
		if (event.key === "Enter") {
			this.quizNavigated = true;
		}
		this.moveTransition();
	}

	async isInvalidScreen() {
		return !this.isActive;
	}

	handleClick(event) {
		if (event.target.className !== "title") {
			this.quizNavigated = true;
		}
		this.moveTransition();
	}

	moveTransition() {
		this.transitChar();
	}

	transitChar() {
		// eslint-disable-next-line no-undef
		gsap.to(this.template.querySelector(".title"), {
			duration: 1,
			rotationY: -180,
			rotationX: -180,
			transformOrigin: "right center",
			ease: "power2.inOut",
			onComplete: () => {
				this.transitVideo();
			}
		});
	}

	transitVideo() {
		if (this.quizNavigated) {
			this.navigateToQuiz();
			return;
		}
		if (this.isLast) {
			this.navigateToHome();
			return;
		}
		// eslint-disable-next-line no-undef
		gsap.to(this.template.querySelector(".video"), {
			duration: 1,
			rotationY: -180,
			rotationX: -180,
			transformOrigin: "right center",
			ease: "power2.inOut",
			onComplete: () => {
				this.notifyTransition();
			}
		});
	}

	navigateToQuiz() {
		const navigationConfig = {
			type: "comm__namedPage",
			attributes: {
				pageName: "quiz"
			}
		};
		if (this.type) {
			navigationConfig.state = {
				type: this.type
			};
		}
		this[NavigationMixin.Navigate](navigationConfig);
	}

	navigateToHome() {
		this[NavigationMixin.Navigate]({
			type: "comm__namedPage",
			attributes: {
				pageName: "home"
			}
		});
	}

	notifyTransition() {
		this.dispatchEvent(new CustomEvent("transition"));
	}

	@api
	activateScreen() {
		// eslint-disable-next-line @lwc/lwc/no-api-reassignments
		this.isActive = true;
	}

	async handleVideoLoaded() {
		if (await this.isInvalidScreen()) {
			return;
		}
		this.dispatchEvent(
			new CustomEvent("videoloaded", {
				detail: this.zIndex
			})
		);
	}
}