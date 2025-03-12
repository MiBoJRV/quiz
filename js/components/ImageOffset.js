class ImageOffset {
	constructor() {
		this.quizImage = document.querySelector('.quiz-image');
		this.baseWidth = 1200;
		this.init();
	}

	init() {
		this.handleResize();
		window.addEventListener('resize', () => this.handleResize());
	}

	handleResize() {
		const currentWidth = window.innerWidth;

		if (currentWidth <= this.baseWidth && currentWidth > 992) {
			const offset = this.baseWidth - currentWidth;
			this.quizImage.style.right = `-${offset}px`;
		} else {
			this.quizImage.style.right = '0';
		}
	}
}

document.addEventListener('DOMContentLoaded', () => {
	new ImageOffset();
}); 