import type { RequestQuestion } from "@/models/request/question";
import type { ResponseQuestion } from "@/models/response/question";
import { normalizeTextFormat } from "@/services/RichContentService";

/** Editor chỉ có Rich text (Html) hoặc Markdown; PlainText cũ được giữ nguyên để backend không coi là câu hỏi đã đổi */
const editorTextFormat = (format?: string | null): string => normalizeTextFormat(format) ?? "Html";

class TranferQuestionData {
    transformResponseToRequest(responseQuestion: ResponseQuestion): RequestQuestion {
        const matchingPairs = responseQuestion.questionData.matching
            ? responseQuestion.questionData.matching.leftItems.map((leftItem) => {
                  const match = responseQuestion.questionData.matching!.matches.find(
                      (m) => m.leftId === leftItem.id,
                  );
                  const rightItem = match
                      ? responseQuestion.questionData.matching!.rightItems.find(
                            (ri) => ri.id === match.rightId,
                        )
                      : null;

                  return {
                      id: leftItem.id,
                      leftItem: leftItem.text,
                      rightItem: rightItem?.text || "",
                  };
              })
            : [];

        return {
            id: responseQuestion.id,
            type: responseQuestion.type,
            // giữ nguyên chế độ nội dung để trang sửa không biến Markdown thành HTML khi lưu
            textFormat: editorTextFormat(responseQuestion.textFormat),
            questionText: responseQuestion.questionText,
            questionHTML: responseQuestion.questionText,
            explainText: responseQuestion.explainText,
            score: responseQuestion.score,
            multipleChoices: responseQuestion.questionData.multipleChoice || [],
            matchingPairs: matchingPairs,
            orderingItems: responseQuestion.questionData.ordering || [],
            shortAnswer: responseQuestion.questionData.shortText || "",
            mediaId: responseQuestion.media?.id ?? null,
            media: responseQuestion.media ?? null,
        };
    }

    transformRequestToResponse(
        requestQuestion: RequestQuestion,
        questionSetId: string,
    ): ResponseQuestion {
        const leftItems = requestQuestion.matchingPairs.map((pair) => ({
            id: pair.id,
            text: pair.leftItem,
        }));

        const rightItems = requestQuestion.matchingPairs
            .filter((pair) => pair.rightItem)
            .map((pair, index) => ({
                id: `right_${index}`,
                text: pair.rightItem,
            }));

        const matches = requestQuestion.matchingPairs
            .filter((pair) => pair.rightItem)
            .map((pair, index) => ({
                leftId: pair.id,
                rightId: `right_${index}`,
            }));

        return {
            id: requestQuestion.id,
            type: requestQuestion.type,
            questionSetId: questionSetId,
            textFormat: editorTextFormat(requestQuestion.textFormat),
            questionText: requestQuestion.questionText,
            explainText: requestQuestion.explainText,
            score: requestQuestion.score,
            scoreGraded: requestQuestion.score,
            correctMultipleChoiceCount: requestQuestion.multipleChoices.filter((x) => x.isAnswer)
                .length,
            media: requestQuestion.media ?? null,
            questionData: {
                multipleChoice:
                    requestQuestion.multipleChoices.length > 0
                        ? requestQuestion.multipleChoices
                        : null,
                matching:
                    requestQuestion.matchingPairs.length > 0
                        ? {
                              leftItems: leftItems,
                              rightItems: rightItems,
                              matches: matches,
                          }
                        : null,
                ordering:
                    requestQuestion.orderingItems.length > 0 ? requestQuestion.orderingItems : null,
                shortText: requestQuestion.shortAnswer,
            },
        };
    }
}
export default new TranferQuestionData();
