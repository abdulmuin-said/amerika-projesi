"use client";
import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ChevronDown, ChevronUp, Send } from "lucide-react";
import useDataFetch from "@/hooks/use-data-fetch";
import * as qaServices from "@/services/qa";
import { QuestionDetails } from "@/types/domains/qa";
import { useAppSelector } from "@/store/hooks";
import { toast } from "sonner";

interface ProductQAProps {
    productId: number;
}

const HARDCODED_FAQS = [
    {
        id: "faq-1",
        question: "Are these waterproof?",
        answer: "Yes, we use special inks that are waterproof. All our art prints can be cleaned with a damp cloth, just dust them and they will be as good as new.",
    },
    {
        id: "faq-2",
        question: "Are these ready to hang?",
        answer: "Our paintings and art prints come ready to hang out of the box with metal hooks or double sided tape, depending on the design / style / material you choose.",
    },
    {
        id: "faq-3",
        question: "What precautions are to be taken?",
        answer: "Avoid using harsh chemicals on any printed surface. Avoid direct sunlight or high humidity areas.",
    },
    {
        id: "faq-4",
        question: "Are the paintings safe for homes with kids or pets?",
        answer: "Yes, we use inks with \"Green Guard\" certified technology and they are odour free — can be safely used in kids rooms or homes with pets.",
    },
    {
        id: "faq-5",
        question: "What is the life of the painting?",
        answer: "We use the industry's best materials in creating our products, and they are yours for a lifetime to cherish. Our paintings won't fade for many years to come and our frame materials are strong, sturdy and made to withstand the test of time.",
    },
];

export const ProductQA = ({ productId }: ProductQAProps) => {
    const [expandedFaqs, setExpandedFaqs] = useState<Set<string>>(new Set());
    const [answeredQuestions, setAnsweredQuestions] = useState<QuestionDetails[]>([]);
    const [questionText, setQuestionText] = useState("");

    const { authenticated } = useAppSelector(state => state.auth);
    const getQuestions = useDataFetch(qaServices.getQuestions);
    const postQuestion = useDataFetch(qaServices.postQuestion);

    const loadAnsweredQuestions = useCallback(() => {
        getQuestions.request(productId, 0, 20)
            .onSuccess((data: QuestionDetails[]) => {
                setAnsweredQuestions(data.filter(q => q.answers.length > 0));
            })
            .onError(() => {
                // silently fail — questions are public; 401 means backend needs config fix
            });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [productId]);

    useEffect(() => {
        loadAnsweredQuestions();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [productId]);

    const toggleFaq = (id: string) => {
        setExpandedFaqs(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id); else next.add(id);
            return next;
        });
    };

    const handlePostQuestion = () => {
        if (!questionText.trim()) return;
        postQuestion.request({ productId, questionText: questionText.trim() })
            .onSuccess(() => {
                setQuestionText("");
                toast.success("Question submitted! We'll get back to you soon.");
            })
            .onError((err) => toast.error("Failed to submit question: " + err));
    };

    const hasAnsweredQuestions = answeredQuestions.length > 0;

    return (
        <div className="border-t border-border pt-10">

            {/* Two-column: FAQs left, customer questions + ask form right */}
            <div className="grid md:grid-cols-[1fr_360px] gap-8 md:gap-12">

                {/* Left — hardcoded FAQ accordion */}
                <div className="md:border-r md:border-border md:pr-8">
                    {/* Title inside the column — aligns with Customer Reviews title above */}
                    <h2 className="font-display text-3xl font-medium mb-5">FAQs</h2>
                    <div className="border-t border-border">
                        {HARDCODED_FAQS.map((faq) => {
                            const open = expandedFaqs.has(faq.id);
                            return (
                                <div key={faq.id} className="border-b border-border last:border-b-0">
                                    <button
                                        type="button"
                                        onClick={() => toggleFaq(faq.id)}
                                        className="w-full flex items-center justify-between gap-4 py-4 text-left hover:text-primary transition-colors group"
                                    >
                                        <span className="font-medium text-sm leading-relaxed">{faq.question}</span>
                                        {open
                                            ? <ChevronUp className="h-4 w-4 shrink-0 text-muted-foreground group-hover:text-primary transition-colors" />
                                            : <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground group-hover:text-primary transition-colors" />
                                        }
                                    </button>
                                    {open && (
                                        <p className="text-sm text-muted-foreground leading-relaxed pb-4 pr-6">
                                            {faq.answer}
                                        </p>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Right — customer questions (answered only) + ask form (vertically centered) */}
                <div className="flex flex-col justify-center h-full space-y-6">

                    {/* Answered customer questions */}
                    {getQuestions.isLoading ? (
                        <div className="space-y-3">
                            {Array.from({ length: 2 }).map((_, i) => (
                                <div key={i} className="h-16 bg-muted animate-pulse rounded" />
                            ))}
                        </div>
                    ) : hasAnsweredQuestions && (
                        <div>
                            <h3 className="text-sm font-semibold tracking-wide uppercase text-muted-foreground mb-4">
                                Customer Questions
                            </h3>
                            <div className="border-t border-border">
                                {answeredQuestions.slice(0, 5).map((q) => (
                                    <div key={q.questionId} className="py-4 border-b border-border last:border-b-0">
                                        <p className="font-medium text-sm leading-relaxed">{q.questionText}</p>
                                        <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">
                                            {q.answers[0].answerText}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Ask a question form */}
                    <div className={hasAnsweredQuestions ? "border-t border-border pt-6" : ""}>
                        <h3 className="font-display text-xl font-medium">Have a Question?</h3>
                        <p className="text-sm text-muted-foreground mt-1 mb-4">Ask the seller about this product</p>
                        <Textarea
                            placeholder="Type your question here..."
                            value={questionText}
                            onChange={(e) => setQuestionText(e.target.value)}
                            className="resize-none"
                            rows={3}
                        />
                        {!authenticated && (
                            <p className="text-sm text-muted-foreground mt-3">
                                You need to be logged in to submit a question.{" "}
                                <a href="/login" className="text-foreground underline underline-offset-2 font-medium">Login</a>
                            </p>
                        )}
                        <Button
                            onClick={handlePostQuestion}
                            disabled={postQuestion.isLoading || !questionText.trim() || !authenticated}
                            className="mt-3 rounded-none"
                        >
                            {postQuestion.isLoading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin mr-2" />
                                    Submitting...
                                </>
                            ) : (
                                <>
                                    <Send className="w-4 h-4 mr-2" />
                                    Submit Question
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};
