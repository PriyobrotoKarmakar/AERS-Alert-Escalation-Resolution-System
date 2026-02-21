import api from './axios'


export const getRulesConfig = () => api.get('/config/rules')


export const updateRule = (ruleId, ruleData) => api.put(`/config/rules/${ruleId}`, ruleData)

export const getRuleByName = (ruleName) => api.get(`/config/rules/${ruleName}`)


export const reloadRules = () => api.post('/config/rules/reload')
