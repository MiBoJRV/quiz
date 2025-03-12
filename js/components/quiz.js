class Quiz {
	constructor(data) {
		this.quizData = data;
		this.currentQuestion = 0;
		this.userAnswers = [];
		this.initializeElements();
		this.setupEventListeners();
		this.setupPhoneInput();
		this.loadQuestion();
	}

	initializeElements() {
		this.quizSection = document.querySelector('.quiz-section');
		this.questionNumber = document.querySelector('.question-number');
		this.questionText = document.querySelector('.question-text');
		this.optionsContainer = document.querySelector('.options');
		this.registrationForm = document.querySelector('.registration-form');
	}

	setupEventListeners() {
		document.getElementById('regForm').addEventListener('submit', (e) => this.handleSubmit(e));
		this.setupValidation();
	}

	setupPhoneInput() {
		const phoneInput = document.querySelector("#phone");

		const getCountryCode = (callback) => {
			fetch("https://ipapi.co/json")
				.then(res => res.json())
				.then(data => callback(data.country_code))
				.catch(() => callback("us"));
		};

		this.iti = window.intlTelInput(phoneInput, {
			geoIpLookup: getCountryCode,
			loadUtils: () => import("https://cdn.jsdelivr.net/npm/intl-tel-input@25.3.0/build/js/utils.js?1733756310855"),
			separateDialCode: true,
			strictMode:true,
			validationNumberTypes: "MOBILE",
			fixDropdownWidth: true,
			formatAsYouType: true,
			initialCountry: "auto",
			allowDropdown: true,
			autoPlaceholder: "polite",
		});

		phoneInput.addEventListener("input", () => {
			phoneInput.value = phoneInput.value.replace(/\D/g, "");
		});

		phoneInput.addEventListener("countrychange", () => {
			phoneInput.value = '';
		});
	}

	setupValidation() {
		const nameInput = document.getElementById('name');
		const emailInput = document.getElementById('email');
		const phoneInput = document.querySelector("#phone");

		nameInput.addEventListener('input', () => this.validateField('name', nameInput));
		emailInput.addEventListener('input', () => this.validateField('email', emailInput));
		phoneInput.addEventListener('input', () => this.validateField('phone', phoneInput));

		nameInput.addEventListener('blur', () => this.validateField('name', nameInput));
		emailInput.addEventListener('blur', () => this.validateField('email', emailInput));
		phoneInput.addEventListener('blur', () => this.validateField('phone', phoneInput));
	}

	validateField(fieldName, input) {
		const errorElement = document.querySelector(`[data-error="${fieldName}"]`);
		let isValid = true;
		let errorMessage = '';

		if (!input.value.trim()) {
			isValid = false;
			errorMessage = 'This field is required';
		} else {
			switch (fieldName) {
				case 'name':
					const nameRegex = /^[a-zA-Zа-яА-ЯіІїЇєЄ\s]{2,50}$/;
					isValid = nameRegex.test(input.value);
					errorMessage = 'Please enter a valid name (2-50 characters)';
					break;

				case 'email':
					const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
					isValid = emailRegex.test(input.value);
					errorMessage = 'Please enter a valid email address';
					break;

				case 'phone':
					const phoneDigits = input.value.replace(/\D/g, "");
					if (!this.iti.isValidNumber()) {
						isValid = false;
						errorMessage = 'Please enter a valid phone number';
					}
					break;
			}
		}

		if (!isValid) {
			input.classList.add('error');
			errorElement.textContent = errorMessage;
			errorElement.classList.add('visible');
		} else {
			input.classList.remove('error');
			errorElement.classList.remove('visible');
		}

		return isValid;
	}

	loadQuestion() {
		const currentQuiz = this.quizData[this.currentQuestion];
		this.questionNumber.textContent = `${this.currentQuestion + 1}/${this.quizData.length}`;
		this.questionText.textContent = currentQuiz.question;

		this.optionsContainer.innerHTML = '';
		currentQuiz.options.forEach((option, index) => {
			const optionElement = document.createElement('div');
			optionElement.classList.add('option');
			optionElement.textContent = option;
			optionElement.addEventListener('click', () => this.selectOption(index));
			this.optionsContainer.appendChild(optionElement);
		});
	}

	selectOption(index) {
		const options = this.optionsContainer.querySelectorAll('.option');
		options.forEach(option => option.classList.remove('selected'));
		options[index].classList.add('selected');
		this.userAnswers[this.currentQuestion] = index;

		setTimeout(() => {
			if (this.currentQuestion < this.quizData.length - 1) {
				this.currentQuestion++;
				this.loadQuestion();
			} else {
				this.showRegistrationForm();
			}
		}, 300);
	}

	showRegistrationForm() {
		this.quizSection.style.display = 'none';
		this.registrationForm.style.display = 'flex';
	}

	validateForm(formData) {
		const nameInput = document.getElementById('name');
		const emailInput = document.getElementById('email');
		const phoneInput = document.querySelector("#phone");

		const isNameValid = this.validateField('name', nameInput);
		const isEmailValid = this.validateField('email', emailInput);
		const isPhoneValid = this.validateField('phone', phoneInput);

		return isNameValid && isEmailValid && isPhoneValid;
	}

	handleSubmit(e) {
		e.preventDefault();
		const formData = new FormData(e.target);

		if (!this.validateForm(formData)) {
			return;
		}

		const submitData = {
			name: formData.get('name'),
			email: formData.get('email'),
			phone: this.iti.getNumber(),
			quizAnswers: this.userAnswers
		};

		this.sendData(submitData);
	}

	sendData(data) {
		console.log('Data to send:', data);

		document.getElementById('regForm').style.display = 'none';
		document.querySelector('.form-title').style.display = 'none';


		const successMessage = document.createElement('div');
		successMessage.className = 'success-message';
		successMessage.innerHTML = `
		
			<p>Your data is successfully sent.</p>
		`;

		this.registrationForm.appendChild(successMessage);

		/*
		fetch('/api/submit', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(data)
		})
		*/

		fetch("https://httpbin.org/post", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(data)
		})
			.then(response => response.json())
			.then(data => console.log("Response:", data))
			.catch(error => console.error("Error:", error));


	}
}

window.Quiz = Quiz;
