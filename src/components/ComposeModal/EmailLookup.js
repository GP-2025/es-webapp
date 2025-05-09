import {
	ChevronDown, ChevronUp,
	User,
	X,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { Controller } from "react-hook-form";
import { useTranslation } from "react-i18next"; // Import the hook
import getContacts from "../../services/getContactsService"; // Import the service

const EmailLookup = ({ control, errors }) => {
	const { t, i18n } = useTranslation(); // Access translation and i18n instance
	const language = i18n.language;
	const [isDropdownOpen, setIsDropdownOpen] = useState(false);
	const [inputValue, setInputValue] = useState("");
	const [filteredOptions, setFilteredOptions] = useState([]);
	const [contacts, setContacts] = useState([]);

	// Fetch contacts on component mount
	useEffect(() => {
		const fetchContacts = async () => {
			try {
				const data = await getContacts();
				// console.log(data);

				setContacts(data);
				setFilteredOptions(data);
			} catch (error) {
				console.error("Error fetching contacts:", error);
			}
		};
		fetchContacts();
	}, []);

	// Handle input change
	const handleInputChange = (e, field) => {
		const value = e.target.value;
		setInputValue(value);
		setIsDropdownOpen(true);

		const currentRecipients = field.value || [];

		const filtered = contacts.filter(
			(item) =>
				!currentRecipients.includes(item.email) &&
				(item.email.toLowerCase().includes(value.toLowerCase()) ||
					item.name.toLowerCase().includes(value.toLowerCase()) ||
					(item.departmentName &&
						item.departmentName.toLowerCase().includes(value.toLowerCase())))
		);

		setFilteredOptions(filtered || contacts);
	};

	// Handle option selection
	const handleOptionSelect = (option, field, id) => {
		// console.log(id);
		const currentRecipients = field.value || [];
		if (!currentRecipients.includes(option.email)) {
			const newRecipients = [...currentRecipients, option.email];
			field.onChange(newRecipients);
		}
		setInputValue("");
		setIsDropdownOpen(false);
	};

	// Remove selected recipient
	const removeRecipient = (email, field) => {
		const newRecipients = (field.value || []).filter(
			(recipient) => recipient !== email
		);
		field.onChange(newRecipients);
	};

	return (
		<div
			className="w-full"
			dir={language === "ar" ? "rtl" : "ltr"}
			lang={language}
		>
			<label
				htmlFor="recipients"
				className={`block text-sm font-semibold ${language === "ar" ? "text-right" : "text-left"
					} text-gray-700 mb-1 flex items-center gap-2`}
			>
				<User className="w-5 h-5 text-gray-500" />
				{t("Compose.Recipients")}
			</label>
			<Controller
				name="recipients"
				control={control}
				defaultValue={[]}
				rules={{
					validate: (value) =>
						value && value.length > 0 ? true : t("Compose.recipientRequired"),
				}}
				render={({ field }) => (
					<div className="space-y-1.5">
						{/* Selected Recipients */}
						<div className="flex flex-wrap gap-1">
							{field.value &&
								field.value.map((email) => (
									<div
										key={email}
										className={`flex items-center ${language === "ar" ? "flex-row-reverse" : "flex-row"}
										bg-indigo-200 text-indigo-800 pl-1.5 pr-0.5 py-0.5 rounded-md text-xs`}
									>
										{email}

										<X
											className={`ml-1 h-5 w-5 p-1 cursor-pointer`}
											onClick={() => removeRecipient(email, field)}
										/>
									</div>
								))}
						</div>

						{/* Input with Dropdown */}
						<div className="relative">
							<input
								type="text"
								id="recipients"
								value={inputValue}
								onChange={(e) => handleInputChange(e, field)}
								className={`w-full border ${errors.recipients
									? "border-red-500"
									: "border-gray-300 focus:ring-indigo-400"
									} rounded-md py-2 px-3 text-sm shadow-sm focus:outline-none ${language === "ar" ? "text-right" : "text-left"
									}`}
								placeholder={
									language === "ar"
										? "البحث عن البريد الإلكتروني أو الاسم أو القسم"
										: "Search email, name, or department"
								}
								onFocus={() => setIsDropdownOpen(true)}
							/>

							<div
								onClick={() => setIsDropdownOpen(!isDropdownOpen)}
								className="absolute inset-y-0 end-0 flex items-center px-2.5 cursor-pointer"
							>
								{isDropdownOpen ? (
									<ChevronUp className="h-5 w-5 text-gray-400" />
								) : (
									<ChevronDown className="h-5 w-5 text-gray-400" />
								)}
							</div>
							{(isDropdownOpen ||
								(inputValue && filteredOptions.length > 0)) && (
									<div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-auto text-sm">
										{filteredOptions.map((option) => (
											<div
												key={option.email}
												className="px-3 py-1.5 hover:bg-gray-200 cursor-pointer"
												onClick={() =>
													handleOptionSelect(option, field, option.id)
												}
											>
												<div
													className={`flex justify-between `}
												>
													<span className="font-medium truncate">
														{option.name}
													</span>
													<span className="text-gray-500 text-xs">
														{option.departmentName || ""}
													</span>
												</div>
												<div className={`text-xs text-gray-600 truncate ${language === "ar" ? "text-right" : "text-left"}`}>
													{option.email}
												</div>
											</div>
										))}
									</div>
								)}
						</div>
					</div>
				)}
			/>
			{errors.recipients && (
				<p
					className={`text-red-500 text-xs mt-0.5 ${language === "ar" ? "text-right" : "text-left"
						}`}
				>
					{errors.recipients.message}
				</p>
			)}
		</div>
	);
};

export default EmailLookup;
