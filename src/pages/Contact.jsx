

import React, { useState } from 'react';

const Contact = () => {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault(); // prevent page reload
    setSubmitted(true);

    // Clear form inputs
    e.target.reset();

    // Hide success message after 3s
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <div className="py-30">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col items-center text-sm text-slate-800"
      >
        <p className="text-xs bg-indigo-200 text-indigo-600 font-medium px-3 py-1 rounded-full">
          Contact Us
        </p>
        <h1 className="text-4xl font-bold py-4 text-center">
          Let’s <span className="text-solid">Get In Touch.</span>
        </h1>
        <p className="max-md:text-sm text-gray-500 pb-10 text-center">
          Or just reach out manually to us at{" "}
          <a href="#" className="text-indigo-600 hover:underline">
            hello@yumzy.com
          </a>
        </p>

        <div className="max-w-96 w-full px-4">
          <label className="font-medium">Full Name</label>
          <div className="flex items-center mt-2 mb-4 h-10 pl-3 border border-slate-300 rounded-full focus-within:ring-2 focus-within:ring-indigo-400 transition-all overflow-hidden">
            <input
              type="text"
              className="h-full px-2 w-full outline-none bg-transparent"
              placeholder="Enter your full name"
              required
            />
          </div>

          <label className="font-medium mt-4">Email Address</label>
          <div className="flex items-center mt-2 mb-4 h-10 pl-3 border border-slate-300 rounded-full focus-within:ring-2 focus-within:ring-indigo-400 transition-all overflow-hidden">
            <input
              type="email"
              className="h-full px-2 w-full outline-none bg-transparent"
              placeholder="Enter your email address"
              required
            />
          </div>

          <label className="font-medium mt-4">Message</label>
          <textarea
            rows="4"
            className="w-full mt-2 p-2 bg-transparent border border-slate-300 rounded-lg resize-none outline-none focus:ring-2 focus-within:ring-indigo-400 transition-all"
            placeholder="Enter your message"
            required
          ></textarea>

          <button
            type="submit"
            className="flex items-center justify-center gap-1 mt-5 bg-solid hover:bg-solidOne text-white py-2.5 w-full rounded-full transition"
          >
            Submit Form
          </button>

          {/*  Success Message */}
          {submitted && (
            <p className="mt-4 text-green-600 font-medium text-center">
              ✅ Your message has been submitted successfully!
            </p>
          )}
        </div>
      </form>
    </div>
  );
};

export default Contact;

