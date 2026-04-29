"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { useTranslate } from "@/hooks/useTranslate";

interface ContributionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ContributionModal({ isOpen, onClose }: ContributionModalProps) {
  const [formData, setFormData] = useState({
    type: "Testimonials",
    name: "",
    address: "",
    description: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");
  const [errors, setErrors] = useState<{
    name?: string;
    description?: string;
    general?: string;
  }>({});

  const validateForm = () => {
    const newErrors: typeof errors = {};

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = nameRequiredText;
    } else if (formData.name.trim().length < 2) {
      newErrors.name = nameMinLengthText;
    } else if (formData.name.trim().length > 100) {
      newErrors.name = nameMaxLengthText;
    }

    // Description validation
    if (!formData.description.trim()) {
      newErrors.description = messageRequiredText;
    } else if (formData.description.trim().length < 10) {
      newErrors.description = messageMinLengthText;
    } else if (formData.description.trim().length > 1000) {
      newErrors.description = messageMaxLengthText;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const [
    closeText,
    modalTitle,
    modalSubtitle,
    chooseTypeText,
    testimonialsLabel,
    testimonialsDesc,
    prayerRequestsLabel,
    prayerRequestsDesc,
    intentionsLabel,
    intentionsDesc,
    yourNameText,
    namePlaceholder,
    addressText,
    optionalText,
    addressPlaceholder,
    yourMessageText,
    messagePlaceholder,
    charactersText,
    successTitleText,
    successBodyText,
    errorTitleText,
    errorBodyText,
    cancelText,
    submittingText,
    sendingText,
    submitContributionText,
    submitText,
    nameRequiredText,
    nameMinLengthText,
    nameMaxLengthText,
    messageRequiredText,
    messageMinLengthText,
    messageMaxLengthText,
  ] = useTranslate([
    "Close",
    "Public Interventions",
    "Share your testimonials, prayer requests, or intentions with our faith community",
    "Choose Intervention Type",
    "Testimonials",
    "Share your faith journey",
    "Prayer Requests",
    "Request prayers from our community",
    "Intentions",
    "Share your spiritual intentions",
    "Your Name",
    "Enter your full name",
    "Address",
    "(Optional)",
    "Enter your address",
    "Your Message",
    "Share your thoughts, prayers, or intentions...",
    "characters",
    "Successfully Submitted!",
    "Thank you for sharing with our community.",
    "Submission Failed",
    "Please try again or contact support.",
    "Cancel",
    "Submitting...",
    "Sending...",
    "Submit",
    "Submit",
    "Name is required",
    "Name must be at least 2 characters",
    "Name must be less than 100 characters",
    "Message is required",
    "Message must be at least 10 characters",
    "Message must be less than 1000 characters",
  ]);

  const contributionTypes = [
    {
      value: "Testimonials",
      label: testimonialsLabel,
      description: testimonialsDesc,
      color: "blue"
    },
    {
      value: "Prayer Requests",
      label: prayerRequestsLabel,
      description: prayerRequestsDesc,
      color: "purple"
    },
    {
      value: "Intentions",
      label: intentionsLabel,
      description: intentionsDesc,
      color: "pink"
    }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear previous errors
    setErrors({});
    
    // Validate form
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus("idle");

    try {
      const response = await fetch("/api/contributions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          name: formData.name.trim(),
          address: formData.address.trim(),
          description: formData.description.trim(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to submit");
      }

      setSubmitStatus("success");
      setFormData({ type: "Testimonials", name: "", address: "", description: "" });
      setErrors({});
      
      setTimeout(() => {
        onClose();
        setSubmitStatus("idle");
      }, 2500);
    } catch (error) {
      setSubmitStatus("error");
      setErrors({ 
        general: error instanceof Error ? error.message : "An unexpected error occurred" 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData({ ...formData, [field]: value });
    
    // Clear field-specific errors when user starts typing
    if (errors[field as keyof typeof errors]) {
      setErrors({ ...errors, [field]: undefined });
    }
  };

  const getColorClasses = (color: string, isSelected: boolean) => {
    const colors = {
      blue: isSelected 
        ? "border-blue-500 bg-blue-50" 
        : "border-stone-200 hover:border-blue-300",
      purple: isSelected 
        ? "border-purple-500 bg-purple-50" 
        : "border-stone-200 hover:border-purple-300",
      pink: isSelected 
        ? "border-pink-500 bg-pink-50" 
        : "border-stone-200 hover:border-pink-300",
    };
    return colors[color as keyof typeof colors];
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          />

          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="relative w-full sm:max-w-2xl bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden flex flex-col"
            >
              <div className="absolute top-0 left-0 right-0 h-24 sm:h-32 bg-gradient-to-br from-accent/10 via-purple-50 to-pink-50" />
              
              <div className="relative px-4 sm:px-8 pt-6 sm:pt-8 pb-4 sm:pb-6 flex-shrink-0">
                <button
                  onClick={onClose}
                  className="absolute top-4 sm:top-6 right-4 sm:right-6 rounded-full p-2 text-stone-400 hover:bg-white hover:text-stone-600 transition-all hover:shadow-md z-10"
                  aria-label={closeText}
                >
                  <X className="h-5 w-5" />
                </button>
                
                <div className="text-center pr-10">
                  <h2 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 mb-2">
                    {modalTitle}
                  </h2>
                  <p className="text-sm sm:text-base text-stone-600 max-w-md mx-auto">
                    {modalSubtitle}
                  </p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="px-4 sm:px-8 pb-4 sm:pb-8 space-y-4 sm:space-y-6 overflow-y-auto flex-1">
                <div>
                  <label className="block text-sm font-bold text-stone-800 mb-3">
                    {chooseTypeText}
                  </label>
                  <div className="grid grid-cols-1 gap-2.5 sm:gap-3">
                    {contributionTypes.map((type) => {
                      const isSelected = formData.type === type.value;
                      return (
                        <label
                          key={type.value}
                          className={`relative flex items-start gap-3 p-3 sm:p-4 border-2 rounded-xl cursor-pointer transition-all ${getColorClasses(type.color, isSelected)}`}
                        >
                          <input
                            type="radio"
                            name="type"
                            value={type.value}
                            checked={isSelected}
                            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                            className="mt-0.5 w-4 h-4 text-accent focus:ring-accent"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-sm sm:text-base text-stone-900 mb-0.5">{type.label}</div>
                            <div className="text-xs sm:text-sm text-stone-600">{type.description}</div>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label htmlFor="name" className="block text-sm font-bold text-stone-800 mb-2">
                    {yourNameText} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    required
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    className={`w-full px-3 sm:px-4 py-3 sm:py-3.5 border-2 rounded-xl focus:ring-2 focus:ring-accent/20 transition-all text-stone-900 placeholder:text-stone-400 text-sm sm:text-base ${
                      errors.name 
                        ? "border-red-300 focus:border-red-500" 
                        : "border-stone-200 focus:border-accent"
                    }`}
                    placeholder={namePlaceholder}
                    maxLength={100}
                  />
                  {errors.name && (
                    <p className="mt-1 text-xs text-red-600">{errors.name}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="address" className="block text-sm font-bold text-stone-800 mb-2">
                    {addressText} <span className="text-stone-400 font-normal text-xs sm:text-sm">{optionalText}</span>
                  </label>
                  <input
                    type="text"
                    id="address"
                    value={formData.address}
                    onChange={(e) => handleInputChange("address", e.target.value)}
                    className="w-full px-3 sm:px-4 py-3 sm:py-3.5 border-2 border-stone-200 rounded-xl focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all text-stone-900 placeholder:text-stone-400 text-sm sm:text-base"
                    placeholder={addressPlaceholder}
                    maxLength={200}
                  />
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-bold text-stone-800 mb-2">
                    {yourMessageText} <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="description"
                    required
                    rows={5}
                    value={formData.description}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                    className={`w-full px-3 sm:px-4 py-3 sm:py-3.5 border-2 rounded-xl focus:ring-2 focus:ring-accent/20 transition-all resize-none text-stone-900 placeholder:text-stone-400 text-sm sm:text-base ${
                      errors.description 
                        ? "border-red-300 focus:border-red-500" 
                        : "border-stone-200 focus:border-accent"
                    }`}
                    placeholder={messagePlaceholder}
                    maxLength={1000}
                  />
                  <div className="mt-1.5 flex justify-between items-center">
                    <div className="text-xs text-stone-500">
                      {formData.description.length}/1000 {charactersText}
                    </div>
                    {errors.description && (
                      <p className="text-xs text-red-600">{errors.description}</p>
                    )}
                  </div>
                </div>

                <AnimatePresence>
                  {errors.general && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="p-3 sm:p-4 bg-red-50 border-2 border-red-200 rounded-xl"
                    >
                      <p className="font-semibold text-sm sm:text-base text-red-900">Error</p>
                      <p className="text-xs sm:text-sm text-red-700 mt-1">{errors.general}</p>
                    </motion.div>
                  )}

                  {submitStatus === "success" && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="p-3 sm:p-4 bg-green-50 border-2 border-green-200 rounded-xl"
                    >
                      <p className="font-semibold text-sm sm:text-base text-green-900">{successTitleText}</p>
                      <p className="text-xs sm:text-sm text-green-700 mt-1">{successBodyText}</p>
                    </motion.div>
                  )}

                  {submitStatus === "error" && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="p-3 sm:p-4 bg-red-50 border-2 border-red-200 rounded-xl"
                    >
                      <p className="font-semibold text-sm sm:text-base text-red-900">{errorTitleText}</p>
                      <p className="text-xs sm:text-sm text-red-700 mt-1">{errorBodyText}</p>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="flex gap-2.5 sm:gap-3 pt-2 sm:pt-4 sticky bottom-0 bg-white pb-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 px-4 sm:px-6 py-3 sm:py-3.5 border-2 border-stone-200 rounded-xl font-semibold text-sm sm:text-base text-stone-700 hover:bg-stone-50 transition-all active:scale-95"
                  >
                    {cancelText}
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || Object.keys(errors).length > 0}
                    className="flex-1 px-4 sm:px-6 py-3 sm:py-3.5 bg-accent text-white rounded-xl font-semibold text-sm sm:text-base hover:bg-accent/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-accent/20 active:scale-95"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-4 w-4 sm:h-5 sm:w-5" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        <span className="hidden sm:inline">{submittingText}</span>
                        <span className="sm:hidden">{sendingText}</span>
                      </span>
                    ) : (
                      <>
                        <span className="hidden sm:inline">{submitContributionText}</span>
                        <span className="sm:hidden">{submitText}</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
