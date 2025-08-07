import type { ResponseQuestion } from "@/models/response/question";
import QUESTION_TYPE from "@/constants/questionTypes";

class ShuffleQuestionData {
    shuffleArray<T>(original: T[], max = 5): T[] {
        let shuffled: T[] = [];
        let tries = 0;
        do {
            shuffled = original.slice();
            for (let i = shuffled.length - 1; i > 0; i--) {
                const rand = Math.floor(Math.random() * (i + 1));
                [shuffled[i], shuffled[rand]] = [shuffled[rand], shuffled[i]];
            }
            tries++;
            if (original.length <= 1) break;
        } while (shuffled.every((item, idx) => item === original[idx]) && tries < max);
        return shuffled;
    }

    shuffleQuestionOptions(question: ResponseQuestion): ResponseQuestion {
        const json_question = JSON.parse(JSON.stringify(question)) as ResponseQuestion; //clone to avoid mutating oiginal data

        if (json_question.type === QUESTION_TYPE.MATCHING && json_question.questionData.matching) {
            json_question.questionData.matching.rightItems = this.shuffleArray(
                json_question.questionData.matching.rightItems,
            );
            json_question.questionData.matching.leftItems = this.shuffleArray(
                json_question.questionData.matching.leftItems,
            );
        }

        if (json_question.type === QUESTION_TYPE.ORDERING && json_question.questionData.ordering) {
            json_question.questionData.ordering = this.shuffleArray(
                json_question.questionData.ordering,
            );
        }

        return json_question;
    }
}

export default new ShuffleQuestionData();
