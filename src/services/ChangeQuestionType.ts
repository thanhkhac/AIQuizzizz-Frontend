import QUESTION_TYPE from "@/constants/questionTypes";
import type { RequestQuestion } from "@/models/request/question";

class ChangeQuestionType {
    defaultMultipleChoices = () => [
        { id: (Date.now() + 1).toString(), text: "", isAnswer: true },
        { id: (Date.now() + 2).toString(), text: "", isAnswer: false },
        { id: (Date.now() + 3).toString(), text: "", isAnswer: false },
        { id: (Date.now() + 4).toString(), text: "", isAnswer: false },
    ];
    
    defaultMatchingPairs = () => [
        { id: (Date.now() + 1).toString(), leftItem: "", rightItem: "" },
        { id: (Date.now() + 2).toString(), leftItem: "", rightItem: "" },
    ];

    defaultOrderingItems = () => [
        { id: (Date.now() + 1).toString(), text: "", correctOrder: 0 },
        { id: (Date.now() + 2).toString(), text: "", correctOrder: 1 },
        { id: (Date.now() + 3).toString(), text: "", correctOrder: 2 },
        { id: (Date.now() + 4).toString(), text: "", correctOrder: 3 },
    ];

    onChangeQuestionType = (question: RequestQuestion) => {
        switch (question.type) {
            case QUESTION_TYPE.MULTIPLE_CHOICE:
                if (!question.multipleChoices || question.multipleChoices?.length === 0)
                    question.multipleChoices = this.defaultMultipleChoices();
                break;
            case QUESTION_TYPE.MATCHING:
                if (!question.matchingPairs || question.matchingPairs?.length === 0)
                    question.matchingPairs = this.defaultMatchingPairs();
                break;
            case QUESTION_TYPE.ORDERING:
                if (!question.orderingItems || question.orderingItems?.length === 0)
                    question.orderingItems = this.defaultOrderingItems();
                break;
            case QUESTION_TYPE.SHORT_TEXT:
                question.shortAnswer ??= "";
                break;
        }
    };
}

export default new ChangeQuestionType();
