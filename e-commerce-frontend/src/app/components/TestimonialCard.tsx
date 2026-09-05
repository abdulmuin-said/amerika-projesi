/* eslint-disable @typescript-eslint/no-unused-vars */
import { Card } from "@/components/ui/card";
import Image from "next/image";

interface TestimonialCardProps {
  testimonial: string;
  clientName: string;
  clientImage: string;
}

export const TestimonialCard = ({ testimonial, clientName, clientImage }: TestimonialCardProps) => {
  return (
    <div className="p-6 border ">
      <div className="space-y-6">
        <Image src="/quote.png" alt="" width={48} height={48} className="w-12 h-12" />
        <p className="text-lg leading-7">
          {testimonial}
        </p>
        <div className="flex items-center gap-4">
          <Image
            src={clientImage}
            alt={`${clientName} profile`}
            width={48}
            height={48}
            className="w-12 h-12 rounded-full object-cover border-2 border-border"
          />
          <span className="text-muted-foreground font-medium">{clientName}</span>
        </div>
      </div>
    </div>
  );
};