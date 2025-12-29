# Wireframes (low-fi) - Personalized Migration Plan MVP

1) Survey / plan creation
- Route: /plan/create
- Sections:
  - Basic info: name, email (optional), user id (if logged in)
  - Goal: visa type (select), target date
  - Background: education, work experience, IELTS, dependents
  - Documents: checklist (multi-select) and upload option (optional)
  - Additional: budget, timeline preference
  - Submit -> shows generated plan id and link to Plan Viewer

2) Plan Viewer
- Route: /plan/:key
- Header: plan summary, export button (HTML / PDF), Save as template (premium)
- Roadmap: ordered steps with estimated dates and checkboxes
- Checklist: grouped items, progress bar
- Actions: mark step done, download export, request expert review (premium)

3) Template Manager (admin/premium)
- Route: /admin/templates
- Upload template (pdf/html), define placeholder fields and mapping
- Save mapping presets

Notes:
- On MVP, plan generation is rule-based and returns a simple JSON steps array. Later we can add ML-driven suggestions.
- UI should make it clear which features are premium (export to PDF / auto-fill / expert review)
