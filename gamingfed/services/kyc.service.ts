import { apiFetch } from "@/lib/api/client";
import type { KycRecord } from "./types";

export interface SubmitKycInput {
  fullName: string;
  dateOfBirth: string;
  gender: string;
  nationality: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  profilePicture?: File;
}

function toFormData(input: SubmitKycInput): FormData {
  const fd = new FormData();
  fd.append("fullName", input.fullName);
  fd.append("dateOfBirth", input.dateOfBirth);
  fd.append("gender", input.gender);
  fd.append("nationality", input.nationality);
  fd.append("address", input.address);
  fd.append("city", input.city);
  fd.append("state", input.state);
  fd.append("zipCode", input.zipCode);
  fd.append("country", input.country);
  if (input.profilePicture)
    fd.append("profilePicture", input.profilePicture, input.profilePicture.name);
  return fd;
}

export const kycService = {
  submitKyc: (input: SubmitKycInput) =>
    apiFetch<{ kyc: KycRecord }>("/kyc", {
      method: "POST",
      body: toFormData(input),
    }),
};
