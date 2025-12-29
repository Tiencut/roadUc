/* Simple integration tests for export gating and billing webhook
   Run against a running local server: node be/tests/run-tests.js
*/
const fetch = globalThis.fetch || require('node-fetch')
const fs = require('fs')
const path = require('path')
const jwt = require('jsonwebtoken')

const base = process.env.BASE_URL || 'http://localhost:3000'
const usersFile = path.join(process.cwd(), 'data', 'users.json')
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me'

async function main() {
    console.log('Starting tests against', base)
        // create test user in users.json
    let users = { users: [] }
    try { users = JSON.parse(fs.readFileSync(usersFile, 'utf-8')) } catch (e) {}
    const testId = 'test_user_' + Date.now().toString(36)
    const testEmail = testId + '@example.com'
    const user = { id: testId, email: testEmail, passwordHash: null, role: 'user', premium: false }
    users.users = users.users || []
    users.users.push(user)
    fs.writeFileSync(usersFile, JSON.stringify(users, null, 2), 'utf-8')
    console.log('Created test user', testEmail)

    // create plan for that user
    const planResp = await fetch(base + '/api/plans', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ key: 'plan-' + Date.now().toString(36), userId: testId, answers: { goal: 'Student', education: 'Bachelor', documents: ['passport'] } }) })
    const pj = await planResp.json()
    if (!pj.ok) { console.error('Fail create plan', pj);
        process.exit(2) }
    const key = pj.plan.key
    console.log('Created plan', key)

    // try export without auth -> expect 401
    const noAuth = await fetch(base + '/api/plans/' + encodeURIComponent(key) + '/export', { method: 'POST' })
    console.log('Export without auth status', noAuth.status)
    if (noAuth.status !== 401) console.warn('Expected 401 unauthorized for unauthenticated export')

    // Simulate stripe webhook checkout.session.completed to mark user premium
    const webhookPayload = { type: 'checkout.session.completed', data: { object: { metadata: { userId: testId }, customer: 'cus_test', subscription: 'sub_test' } } }
    const wh = await fetch(base + '/api/billing/webhook', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(webhookPayload) })
    console.log('/api/billing/webhook status', wh.status)
    const whj = await wh.json().catch(() => null)
    console.log('Webhook response', whj)

    // generate token for user and try export
    const token = jwt.sign({ sub: testId, email: testEmail, role: 'user' }, JWT_SECRET)
    const resp = await fetch(base + '/api/plans/' + encodeURIComponent(key) + '/export', { method: 'POST', headers: { authorization: 'Bearer ' + token } })
    console.log('Export with auth status', resp.status)
    const rj = await resp.json().catch(() => null)
    console.log('Export response', rj)

    // check users file to see premium flag updated
    const updatedUsers = JSON.parse(fs.readFileSync(usersFile, 'utf-8'))
    const u = (updatedUsers.users || []).find(x => x.id === testId)
    console.log('User premium flag after webhook:', u && u.premium)

    console.log('TESTS DONE')
}

main().catch(err => { console.error(err);
    process.exit(1) })