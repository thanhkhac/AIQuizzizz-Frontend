import type UserAnswerSubmit from "@/models/response/test/userAnswer";
import type { UserAnswerData } from "@/models/response/test/userAnswer";
import type UserAnswerDTO from "@/models/response/test/userAnswerDTO";
import QUESTION_TYPE from "@/constants/questionTypes";

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
    transferToUserAnswerSubmit(userAnswers: UserAnswerDTO[]): UserAnswerSubmit[] {
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

    transferFromUserAnswerSubmit(userAnswersObj: UserAnswerSubmit[]): UserAnswerDTO[] {
        return userAnswersObj
            .filter((x: UserAnswerSubmit) => x.userAnswerData != null)
            .map((x: UserAnswerSubmit) => {
                return {
                    questionId: x.questionId,
                    type: x.userAnswerData.type,
                    multipleChoices: x.userAnswerData.multipleChoice ?? [],
                    matchingLeft: x.userAnswerData.matching?.length
                        ? x.userAnswerData.matching.map((y) => ({ id: y.leftId }))
                        : [],
                    matchingRight: x.userAnswerData.matching?.length
                        ? x.userAnswerData.matching.map((y) => ({ id: y.rightId }))
                        : [],
                    ordering: x.userAnswerData.ordering?.length
                        ? x.userAnswerData.ordering.map((x) => ({
                              id: x.itemId,
                              correctOrder: x.order,
                          }))
                        : [],
                    shortText: x.userAnswerData.shortText ?? "",
                };
            });
    }
}

export default new TransferUserAnswerData();
