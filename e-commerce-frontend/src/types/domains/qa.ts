export interface UserSummary {
    userId: number;
    fullName: string;
}

export interface AnswerDetails {
    answerId: number;
    answerText: string;
    dateAnswered: string;
    user: UserSummary;
}

export interface QuestionDetails {
    questionId: number;
    questionText: string;
    dateAsked: string;
    user: UserSummary;
    answers: AnswerDetails[];
    totalQuestions: number;
}

export interface QuestionDTO {
    productId: number;
    questionText: string;
}

export interface AnswerDTO {
    answerText: string;
}
