import React from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import { useMutation } from "react-query";
import axios from "axios";
import { TextArea } from "./shared/Input";

// Validation schema using Yup
const validationSchema = Yup.object({
  youtubeUrl: Yup.string()
    .url("Please enter a valid URL")
    .matches(
      /^(https:\/\/www\.youtube\.com\/watch\?v=|https:\/\/youtu\.be\/)[a-zA-Z0-9_-]{11}(\S*)$/,
      "Please enter a valid YouTube URL"
    )
    .required("YouTube URL is required"),
});

// Form data interface
interface FormData {
  youtubeUrl: string;
}

const UrlInput = () => {
  // Initialize React Hook Form with validation schema
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: yupResolver(validationSchema),
  });

  // React Query mutation for sending the URL to the backend
  const mutation = useMutation({
    mutationFn: async (url: string) => {
      const response = await axios.post(
        `${process.env.REACT_APP_BASE_URL}/get-summary`,
        { youtubeUrl: url }
      );
      return response.data;
    },
    onSuccess: (data) => {
      console.log("Response Data:", data);
    },
    onError: (error: any) => {
      console.error("Error:", error.response?.data?.message);
    },
  });

  // Form submission handler
  const onSubmit = (data: FormData) => {
    mutation.mutate(data.youtubeUrl);
  };

  // Function to format and display the summary
  const formatSummary = (summary: string) => {
    const bulletPoints = summary
      .split("\n*")
      .filter((point) => point.trim() !== "");

    return (
      <div className="mt-6 p-4 bg-gray-100 rounded shadow">
        <h3 className="font-bold text-lg mb-2">Summary:</h3>
        <ul className="list-disc list-inside">
          {bulletPoints.map((point, index) => (
            <li key={index} className="mb-1">
              {point.replace(/^\s*\*\*/, "").replace(/\*\*$/, "")}
            </li>
          ))}
        </ul>
      </div>
    );
  };

  return (
    <div>
      <form
        className="w-full flex flex-col gap-4"
        onSubmit={handleSubmit(onSubmit)}
      >
        {/* TextArea Input */}
        <TextArea
          {...register("youtubeUrl")}
          error={!!errors.youtubeUrl}
          helperText={errors.youtubeUrl?.message}
          classProp="placeholder:text-sm"
          name="youtubeUrl"
          outerClassProp="text-center"
          label="Paste your YouTube video link"
          placeholder="e.g., https://www.youtube.com/*** or https://youtu.be/***"
        />

        {/* Submit Button */}
        <button
          type="submit"
          className="outline outline-custom-less-gray px-3 py-3 rounded text-custom-white font-bold uppercase bg-custom-green"
          disabled={mutation.isLoading}
        >
          {mutation.isLoading ? "Loading..." : "Get Summary"}
        </button>
      </form>

      {/* Display summary below the button */}
      {mutation.isSuccess && mutation.data?.summary && (
        <div>{formatSummary(mutation.data.summary)}</div>
      )}
    </div>
  );
};

export default UrlInput;
