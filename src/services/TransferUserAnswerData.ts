import type UserAnswersObject from "@/models/request/test/userAnswer";

interface UserAnswer {
    questionId: string;
    type: string;
    multipleChoices: string[] | null;
    matchingLeft: any[] | null;
    matchingRight: any[] | null;
    ordering: any[] | null;
    shortText: string;
}

function combineMatching(
    left: any[] = [],
    right: any[] = [],
): { leftId: string; rightId: string }[] {
    const result: { leftId: string; rightId: string }[] = [];

    for (let i = 0; i < left.length; i++) {
        result.push({ leftId: left[i].id, rightId: right[i].id });
    }

    return result;
}

class TransferUserAnswerData {
    transferToUserAnswersObject(userAnswers: UserAnswer[]): UserAnswersObject[] {
        return userAnswers.map((ans) => ({
            questionId: ans.questionId,
            userAnswerData: {
                type: ans.type,
                multipleChoice: ans.multipleChoices ?? [],
                matching: combineMatching(ans.matchingLeft ?? [], ans.matchingRight ?? []),
                ordering: ans.ordering?.map((x) => ({ itemId: x.id, order: x.correctOrder })) ?? [],
                shortText: ans.shortText ?? "",
            },
        }));
    }

    transferFromUserAnswersObject(userAnswersObj: UserAnswersObject[]): UserAnswer[] {
        return userAnswersObj.map(({ questionId, userAnswerData }) => ({
            questionId,
            type: userAnswerData.type,
            multipleChoices: userAnswerData.multipleChoice ?? [],
            matchingLeft: userAnswerData.matching.map((x) => ({ id: x.leftId })),
            matchingRight: userAnswerData.matching.map((x) => ({ id: x.rightId })),
            ordering: userAnswerData.ordering.map(x=> ({id: x.itemId, correctOrder: x.order})) ?? [],
            shortText: userAnswerData.shortText ?? "",
        }));
    }
}

export default new TransferUserAnswerData();
