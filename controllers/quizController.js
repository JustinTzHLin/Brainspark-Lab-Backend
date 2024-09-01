import pgDB from '../databases/pgDB.js';

const quizController = {};

/*
 * Store Result in database
 */
quizController.storeResult = async (req, res, next) => {
  const { questionNumber, category, difficulty, questionType, dataArray, answerArray, correctCount } = req.body;
  const { userId } = res.locals;
  console.log(userId, questionNumber, category, difficulty, questionType, dataArray, answerArray, correctCount);
  try {
    const newQuizQuery = 'INSERT INTO quizzes(user_id, question_number, correct_number, category, difficulty, question_type) VALUES($1, $2, $3, $4, $5, $6) Returning *;';
    const newQuizRow = await pgDB.query(newQuizQuery, [
      userId,
      questionNumber,
      correctCount,
      category,
      difficulty,
      questionType
    ]);
    console.log(newQuizRow.rows[0]);
    const quizId = newQuizRow.rows[0].id;

    const newRecord = newQuizRow.rows[0];
    newRecord.data_array = [];

    const newQuestionQuizQuery = 'INSERT INTO question_quiz(quiz_id, question_id) VALUES($1, $2) Returning *;';
    const findQuestionQuery = 'SELECT * FROM questions WHERE content=$1 AND correct_answer=$2 AND user_answer=$3 AND incorrect_answer=$4 AND category=$5 AND difficulty=$6 AND question_type=$7';
    const newQuestionQuery = 'INSERT INTO questions(content, correct_answer, user_answer, incorrect_answer, category, difficulty, question_type) VALUES($1, $2, $3, $4, $5, $6, $7) Returning *;';
    for(let i = 0; i < dataArray.length; i++) {
      let questionId;
      const findQuestionRow = await pgDB.query(findQuestionQuery, [
        dataArray[i].question,
        dataArray[i].correct_answer,
        answerArray[i],
        JSON.stringify(dataArray[i].incorrect_answers),
        dataArray[i].category,
        dataArray[i].difficulty,
        dataArray[i].type
      ]);
      if (findQuestionRow.rows.length > 0) {
        questionId = findQuestionRow.rows[0].id;
        newRecord.data_array.push(findQuestionRow.rows[0]);
        console.log(findQuestionRow.rows[0]);
      } else {
        const newQuestionRow = await pgDB.query(newQuestionQuery, [
          dataArray[i].question,
          dataArray[i].correct_answer,
          answerArray[i],
          JSON.stringify(dataArray[i].incorrect_answers),
          dataArray[i].category,
          dataArray[i].difficulty,
          dataArray[i].type
        ]);
        questionId = newQuestionRow.rows[0].id;
        newRecord.data_array.push(newQuestionRow.rows[0]);
        console.log(newQuestionRow.rows[0]);
      }
      const newQuestionQuizRow = await pgDB.query(newQuestionQuizQuery, [
        quizId,
        questionId
      ]);
      console.log(newQuestionQuizRow.rows[0]);
    }
    res.locals.newRecord = newRecord;
    return next();
  } catch (err) {
    return next({
      log: `quizController.storeResult: ERROR ${err}`,
      status: 500,
      message: { error: 'Error occurred in quizController.storeResult.'}
    });
  }
}

// Export
export default quizController;