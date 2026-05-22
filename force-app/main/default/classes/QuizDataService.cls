/**
 * @description QuizDataService.
 *
 * @version 1.0
 */
public without sharing class QuizDataService {
	/**
	 * @description getQuestions.
	 *
	 * @param jsonParams the jsonParams
	 * @param randomParam the randomParam
	 *
	 * @return the String
	 */
	@AuraEnabled(Cacheable=true)
	public static String getQuestions(String jsonParams, String randomParam) {
		Map<String, Object> params = (Map<String, Object>) JSON.deserializeUntyped(
			jsonParams
		);
		String type = String.valueOf(params.get('type'));
		String query = 'SELECT Id, Name FROM Question__c WHERE Type__c = :type ORDER BY Name';
		Map<Id, Question__c> questionMap = new Map<Id, Question__c>(
			(List<Question__c>) Database.query(String.escapeSingleQuotes(query))
		);
		Set<Id> questionMapKeySet = questionMap.keySet();
		if (Boolean.valueOf(params.get('numberOfFailToggle')) == true) {
			Map<Id, Question__c> failedQuestionMap = createFailedQuestionMap(
				jsonParams
			);
			questionMapKeySet.retainAll(failedQuestionMap.keySet());
		}
		if (Boolean.valueOf(params.get('numberOfSuccessToggle')) == true) {
			Map<Id, Question__c> successedQuestionMap = createSuccessedQuestionMap(
				jsonParams
			);
			questionMapKeySet.retainAll(successedQuestionMap.keySet());
		}
		if (Boolean.valueOf(params.get('numberOfDaysToggle')) == true) {
			Map<Id, Question__c> blankedQuestionMap = createBlankedQuestionMap(
				jsonParams
			);
			questionMapKeySet.retainAll(blankedQuestionMap.keySet());
		}
		if (Boolean.valueOf(params.get('isLastFailedToggle')) == true) {
			Map<Id, Question__c> lastFailedQuestionMap = createLastFailedQuestionMap(
				jsonParams
			);
			questionMapKeySet.retainAll(lastFailedQuestionMap.keySet());
		}
		for (Id i : questionMapKeySet) {
			if (questionMap.containsKey(i)) {
				continue;
			}
			questionMap.remove(i);
		}
		return JSON.serialize(questionMap.values());
	}

	/**
	 * @description getActivities.
	 *
	 * @param jsonParams the jsonParams
	 * @param randomParam the randomParam
	 *
	 * @return the String
	 */
	@AuraEnabled(Cacheable=true)
	public static String getActivities(String jsonParams, String randomParam) {
		Map<String, Object> params = (Map<String, Object>) JSON.deserializeUntyped(
			jsonParams
		);
		String questionId = String.valueOf(params.get('recordId'));
		String localId = String.valueOf(params.get('localId'));
		String query =
			'SELECT Id, IsSuccess__c, Result__c, QuestionId__c, CreatedDate' +
			' FROM QuestionResult__c' +
			' WHERE QuestionId__c = :questionId' +
			' AND QuestionId__c != null' +
			' AND localId__c = :localId' +
			' ORDER BY CreatedDate ASC';
		return JSON.serialize(Database.query(String.escapeSingleQuotes(query)));
	}

	/**
	 * @description getRecordCount.
	 *
	 * @param jsonParams the jsonParams
	 * @param randomParam the randomParam
	 *
	 * @return the String
	 */
	@AuraEnabled(Cacheable=true)
	public static String getRecordCount(String jsonParams, String randomParam) {
		Map<String, Object> params = (Map<String, Object>) JSON.deserializeUntyped(
			jsonParams
		);
		String localId = String.valueOf(params.get('localId'));
		String type = String.valueOf(params.get('type'));
		String query =
			'SELECT COUNT()' +
			' FROM QuestionResult__c' +
			' WHERE localId__c = :localId' +
			' AND QuestionId__r.Type__c = :type' +
			' AND CreatedDate = TODAY';
		return JSON.serialize(
			Database.countQuery(String.escapeSingleQuotes(query))
		);
	}

	/**
	 * @description getStatistics.
	 *
	 * @param jsonParams the jsonParams
	 * @param randomParam the randomParam
	 *
	 * @return the String
	 */
	@AuraEnabled(Cacheable=true)
	public static String getStatistics(String jsonParams, String randomParam) {
		Map<String, Object> params = (Map<String, Object>) JSON.deserializeUntyped(
			jsonParams
		);
		String localId = String.valueOf(params.get('localId'));
		String type = String.valueOf(params.get('type'));
		String query =
			'SELECT Id,' +
			' (SELECT Id , IsSuccess__c' +
			' FROM QuestionResults__r' +
			' WHERE localId__c = :localId' +
			' AND CreatedDate = ' +
			String.valueOf(params.get('span')) +
			' ORDER BY CreatedDate DESC LIMIT 1)' +
			' FROM Question__c' +
			' WHERE Type__c = :type';
		Map<String, List<String>> statistics = new Map<String, List<String>>();
		statistics.put('success', new List<String>());
		statistics.put('fail', new List<String>());
		for (Question__c q : Database.query(String.escapeSingleQuotes(query))) {
			if (q.QuestionResults__r.size() == 0) {
				continue;
			}
			if (q.QuestionResults__r.get(0).IsSuccess__c == true) {
				statistics.get('success').add(q.Id);
			}
			if (q.QuestionResults__r.get(0).IsSuccess__c == false) {
				statistics.get('fail').add(q.Id);
			}
		}
		return JSON.serialize(statistics);
	}

	/**
	 * @description getTotal.
	 *
	 * @param jsonParams the jsonParams
	 * @param randomParam the randomParam
	 *
	 * @return the String
	 */
	@AuraEnabled(Cacheable=true)
	public static String getTotal(String jsonParams, String randomParam) {
		Map<String, Object> params = (Map<String, Object>) JSON.deserializeUntyped(
			jsonParams
		);
		String type = String.valueOf(params.get('type'));
		String query = 'SELECT COUNT() FROM Question__c WHERE Type__c = :type';
		return JSON.serialize(
			Database.countQuery(String.escapeSingleQuotes(query))
		);
	}

	/**
	 * @description getQuestionsByIds.
	 *
	 * @param jsonParams the jsonParams
	 * @param randomParam the randomParam
	 *
	 * @return the String
	 */
	@AuraEnabled(Cacheable=true)
	public static String getQuestionsByIds(
		String jsonParams,
		String randomParam
	) {
		Map<String, Object> params = (Map<String, Object>) JSON.deserializeUntyped(
			jsonParams
		);
		List<String> ids = new List<String>();
		for (Object o : (List<Object>) params.get('ids')) {
			ids.add(String.valueOf(o));
		}
		String query =
			'SELECT Id, Name' +
			' FROM Question__c' +
			' WHERE Id IN :ids' +
			' ORDER BY Name';
		return JSON.serialize(Database.query(String.escapeSingleQuotes(query)));
	}

	/**
	 * @description getProgress.
	 *
	 * @param jsonParams the jsonParams
	 * @param randomParam the randomParam
	 *
	 * @return the String
	 */
	@AuraEnabled(Cacheable=true)
	public static String getProgress(String jsonParams, String randomParam) {
		Map<String, Object> params = (Map<String, Object>) JSON.deserializeUntyped(
			jsonParams
		);
		String localId = String.valueOf(params.get('localId'));
		String type = String.valueOf(params.get('type'));
		String query =
			'SELECT DAY_ONLY(CreatedDate), IsSuccess__c, COUNT(Id)' +
			' FROM QuestionResult__c' +
			' WHERE localId__c = :localId' +
			' AND QuestionId__r.Type__c = :type' +
			' GROUP BY DAY_ONLY(CreatedDate), IsSuccess__c' +
			' ORDER BY DAY_ONLY(CreatedDate) DESC';
		return JSON.serialize(Database.query(String.escapeSingleQuotes(query)));
	}

	/**
	 * @description getTypes.
	 *
	 * @return the String
	 */
	@AuraEnabled(Cacheable=true)
	public static String getTypes() {
		String query = 'SELECT Type__c FROM Question__c GROUP BY Type__c';
		return JSON.serialize(Database.query(String.escapeSingleQuotes(query)));
	}

	/**
	 * @description createFailedQuestionMap.
	 *
	 * @param jsonParams the jsonParams
	 *
	 * @return the Map<Id, Question__c>
	 */
	public static Map<Id, Question__c> createFailedQuestionMap(
		String jsonParams
	) {
		Map<String, Object> params = (Map<String, Object>) JSON.deserializeUntyped(
			jsonParams
		);
		Integer numberOfFail = Integer.valueOf(params.get('numberOfFail'));
		String localId = String.valueOf(params.get('localId'));
		String query =
			'SELECT Id,' +
			' (SELECT Id FROM QuestionResults__r WHERE IsSuccess__c = false AND LocalId__c = :localId)' +
			' FROM Question__c';
		Map<Id, Question__c> failedQuestionMap = new Map<Id, Question__c>(
			(List<Question__c>) Database.query(String.escapeSingleQuotes(query))
		);
		for (Question__c q : failedQuestionMap.values()) {
			if (q.QuestionResults__r.size() == numberOfFail) {
				continue;
			}
			failedQuestionMap.remove(q.Id);
		}
		return failedQuestionMap;
	}

	/**
	 * @description createSuccessedQuestionMap.
	 *
	 * @param jsonParams the jsonParams
	 *
	 * @return the Map<Id, Question__c>
	 */
	public static Map<Id, Question__c> createSuccessedQuestionMap(
		String jsonParams
	) {
		Map<String, Object> params = (Map<String, Object>) JSON.deserializeUntyped(
			jsonParams
		);
		Integer numberOfSuccess = Integer.valueOf(
			params.get('numberOfSuccess')
		);
		String localId = String.valueOf(params.get('localId'));
		String query =
			'SELECT Id,' +
			' (SELECT Id FROM QuestionResults__r WHERE IsSuccess__c = true AND localId__c = :localId)' +
			' FROM Question__c';
		Map<Id, Question__c> successedQuestionMap = new Map<Id, Question__c>(
			(List<Question__c>) Database.query(String.escapeSingleQuotes(query))
		);
		for (Question__c q : successedQuestionMap.values()) {
			if (q.QuestionResults__r.size() == numberOfSuccess) {
				continue;
			}
			successedQuestionMap.remove(q.Id);
		}
		return successedQuestionMap;
	}

	/**
	 * @description createBlankedQuestionMap.
	 *
	 * @param jsonParams the jsonParams
	 *
	 * @return the Question__c>
	 */
	public static Map<Id, Question__c> createBlankedQuestionMap(
		String jsonParams
	) {
		Map<String, Object> params = (Map<String, Object>) JSON.deserializeUntyped(
			jsonParams
		);
		String localId = String.valueOf(params.get('localId'));
		String query =
			'SELECT Id,' +
			' (SELECT Id FROM QuestionResults__r' +
			' WHERE CreatedDate = LAST_N_DAYS:' +
			String.valueOf(params.get('numberOfDays')) +
			' AND localId__c = :localId' +
			' ORDER BY CreatedDate DESC LIMIT 1)' +
			' FROM Question__c';
		Map<Id, Question__c> blankedQuestionMap = new Map<Id, Question__c>(
			(List<Question__c>) Database.query(String.escapeSingleQuotes(query))
		);
		for (Question__c q : blankedQuestionMap.values()) {
			if (q.QuestionResults__r.size() == 1) {
				blankedQuestionMap.remove(q.Id);
			}
		}
		return blankedQuestionMap;
	}

	/**
	 * @description createLastFailedQuestionMap.
	 *
	 * @param jsonParams the jsonParams
	 *
	 * @return the Map<Id, Question__c>
	 */
	public static Map<Id, Question__c> createLastFailedQuestionMap(
		String jsonParams
	) {
		Map<String, Object> params = (Map<String, Object>) JSON.deserializeUntyped(
			jsonParams
		);
		String localId = String.valueOf(params.get('localId'));
		String query =
			'SELECT Id,' +
			' (SELECT Id , IsSuccess__c FROM QuestionResults__r WHERE localId__c = :localId ORDER BY CreatedDate DESC LIMIT 1)' +
			' FROM Question__c';
		Map<Id, Question__c> lastFailedQuestionMap = new Map<Id, Question__c>(
			(List<Question__c>) Database.query(String.escapeSingleQuotes(query))
		);
		for (Question__c q : lastFailedQuestionMap.values()) {
			if (q.QuestionResults__r.size() == 0) {
				lastFailedQuestionMap.remove(q.Id);
				continue;
			}
			if (q.QuestionResults__r.size() == 0) {
				lastFailedQuestionMap.remove(q.Id);
				continue;
			}
			if (q.QuestionResults__r.get(0).IsSuccess__c == false) {
				continue;
			}
			lastFailedQuestionMap.remove(q.Id);
		}
		return lastFailedQuestionMap;
	}

	/**
	 * @description checkAlreadyAnswered.
	 *
	 * @param jsonParams the jsonParams
	 *
	 * @return the Boolean
	 */
	@AuraEnabled(cacheable=false)
	public static Boolean checkAlreadyAnswered(String jsonParams) {
		Map<String, Object> params = (Map<String, Object>) JSON.deserializeUntyped(
			jsonParams
		);
		String questionId = (String) params.get('questionId');
		String localId = (String) params.get('localId');
		String query =
			'SELECT COUNT() FROM QuestionResult__c' +
			' WHERE QuestionId__c = :questionId' +
			' AND LocalId__c = :localId' +
			' AND CreatedDate = TODAY';
		Integer count = Database.countQuery(String.escapeSingleQuotes(query));
		return count > 0;
	}
}
