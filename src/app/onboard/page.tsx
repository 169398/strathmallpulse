"use client";

import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectTrigger,
  SelectValue,
  SelectItem,
} from "@/components/ui/select"; // Adjusting the import
import { useRouter } from "next/navigation";
import { submitOnboarding } from "@/lib/actions/user.actions";

// Define the schema for form validation using Zod
const onboardingSchema = z.object({
  name: z.string().min(1, "Name is required"),
  gender: z.string().min(1, "Gender is required"),
  dateOfBirth: z.string().min(1, "Date of Birth is required"),
  year: z.string().min(1, "Year is required"),
  major: z.string().min(1, "Major is required"),
  interests: z.array(z.string()).min(1, "At least one interest is required"),
  relationshipStatus: z.string().optional(),
  university: z.string().min(1, "University is required"),
});

type OnboardingFormValues = z.infer<typeof onboardingSchema>;

const genderOptions = ["Male", "Female", "Non-binary", "Prefer not to say"];
const yearOptions = ["Freshman", "Sophomore", "Junior", "Senior"];
const universityOptions = ["University A", "University B", "University C"];
const majorOptions = ["Computer Science", "Business", "Engineering", "Arts"];
const relationshipStatusOptions = [
  "Single",
  "In a relationship",
  "Complicated",
  "Prefer not to say",
];

const OnboardingModal = () => {
  const router = useRouter();
  const form = useForm<OnboardingFormValues>({
    resolver: zodResolver(onboardingSchema),
  });

  const {
    handleSubmit,
    control,
    formState: { errors },
  } = form;

  // Function to handle form submission
  const onSubmit = async (data: OnboardingFormValues) => {
    // Convert interests to array
    const formattedData = {
      ...data,
      interests: data.interests.map((interest) => interest.trim()),
    };

    const formData = new FormData();
    Object.entries(formattedData).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        value.forEach((item) => formData.append(key, item));
      } else {
        formData.append(key, value);
      }
    });

    const res = await submitOnboarding(formData);
    if (res.success) {
      router.push("/");
    } else {
      console.error("Onboarding failed:", res.message);
    }
  };

  useEffect(() => {
    const showModal = true;
    if (showModal) {
      // Add your logic for displaying the modal
    }
  }, []);

  return (
    <Dialog open={true} onOpenChange={() => {}}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Complete Your Onboarding</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Controller
              name="name"
              control={control}
              render={({ field }) => (
                <div>
                  <Input placeholder="Name" {...field} />
                  {errors.name && (
                    <p className="text-red-600">{errors.name.message}</p>
                  )}
                </div>
              )}
            />

            <Controller
              name="gender"
              control={control}
              render={({ field }) => (
                <div>
                  <Select {...field}>
                    <SelectTrigger>
                      <SelectValue placeholder="Gender" />
                    </SelectTrigger>
                    <SelectContent>
                      {genderOptions.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.gender && (
                    <p className="text-red-600">{errors.gender.message}</p>
                  )}
                </div>
              )}
            />
          </div>

          <Controller
            name="dateOfBirth"
            control={control}
            render={({ field }) => (
              <div>
                <Input placeholder="Date of Birth" type="date" {...field} />
                {errors.dateOfBirth && (
                  <p className="text-red-600">{errors.dateOfBirth.message}</p>
                )}
              </div>
            )}
          />

          <Controller
            name="year"
            control={control}
            render={({ field }) => (
              <div>
                <Select {...field}>
                  <SelectTrigger>
                    <SelectValue placeholder="Year" />
                  </SelectTrigger>
                  <SelectContent>
                    {yearOptions.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.year && (
                  <p className="text-red-600">{errors.year.message}</p>
                )}
              </div>
            )}
          />

          <Controller
            name="major"
            control={control}
            render={({ field }) => (
              <div>
                <Select {...field}>
                  <SelectTrigger>
                    <SelectValue placeholder="Major" />
                  </SelectTrigger>
                  <SelectContent>
                    {majorOptions.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.major && (
                  <p className="text-red-600">{errors.major.message}</p>
                )}
              </div>
            )}
          />

          <Controller
            name="university"
            control={control}
            render={({ field }) => (
              <div>
                <Select {...field}>
                  <SelectTrigger>
                    <SelectValue placeholder="University" />
                  </SelectTrigger>
                  <SelectContent>
                    {universityOptions.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.university && (
                  <p className="text-red-600">{errors.university.message}</p>
                )}
              </div>
            )}
          />

          <Controller
            name="interests"
            control={control}
            render={({ field }) => (
              <div>
                <Input
                  placeholder="Interests (comma separated)"
                  {...field}
                  onChange={(e) =>
                    field.onChange(
                      e.target.value.split(",").map((interest) => interest.trim())
                    )
                  }
                />
                {errors.interests && (
                  <p className="text-red-600">{errors.interests.message}</p>
                )}
              </div>
            )}
          />

          <Controller
            name="relationshipStatus"
            control={control}
            render={({ field }) => (
              <div>
                <Select {...field}>
                  <SelectTrigger>
                    <SelectValue placeholder="Relationship Status" />
                  </SelectTrigger>
                  <SelectContent>
                    {relationshipStatusOptions.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          />

          <Button type="submit">Complete Onboarding</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default OnboardingModal;
