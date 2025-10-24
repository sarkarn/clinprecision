# Sprint 1 - PR Checklist

## 📋 Pre-Merge Checklist

### **Code Quality**
- [x] All files compile without errors
- [x] No lint warnings introduced
- [x] Code follows existing project conventions
- [x] Comments added for complex logic
- [x] No console.log statements left in code (except intentional logging)

### **Functionality**
- [ ] Study selection persists across page refreshes
- [ ] Study selection persists when navigating between modules
- [ ] StudySelector displays correct studies (PUBLISHED/APPROVED/ACTIVE filter)
- [ ] Status badges render with correct colors
- [ ] SubjectList.jsx loads and displays subjects correctly
- [ ] No regressions in existing functionality

### **Testing**
- [ ] Manual smoke test completed
- [ ] All acceptance criteria validated (see SPRINT_1_COMPLETION_SUMMARY.md)
- [ ] Build runs successfully (`npm run build`)
- [ ] Dev server starts without errors (`npm start`)

### **Documentation**
- [x] Sprint completion summary created
- [x] Component contracts defined in code comments
- [x] README sections updated (if applicable)

### **PR Requirements**
- [ ] PR title: `feat: Sprint 1 - StudyContext & Component Extraction`
- [ ] PR description includes:
  - Summary of changes
  - Link to SPRINT_1_COMPLETION_SUMMARY.md
  - Screenshots (if applicable)
  - Breaking changes: None
- [ ] Target branch: `main` (or `develop`)
- [ ] Reviewers assigned
- [ ] Labels added: `enhancement`, `ux-refactor`, `sprint-1`

---

## 🧪 Test Scenarios

### **Scenario 1: Study Selection Persistence**
1. Navigate to Subject Management → Subject List
2. Select a study from dropdown
3. Navigate to different module
4. Return to Subject List
5. **Expected:** Study remains selected

### **Scenario 2: localStorage Persistence**
1. Select a study
2. Refresh the page (F5)
3. **Expected:** Study remains selected after refresh

### **Scenario 3: Badge Display**
1. Navigate to Subject List with enrolled subjects
2. Check status badges in table
3. **Expected:** Badges display correct colors for each status

### **Scenario 4: Backward Compatibility**
1. Navigate from dashboard with preselected study (if applicable)
2. **Expected:** Study auto-selects from navigation state

---

## 📊 Metrics to Verify

- **Build Time:** Should not increase significantly
- **Bundle Size:** Should not increase significantly (use `npm run build` and check `build/static/js` folder)
- **Runtime Performance:** No noticeable lag when selecting studies

---

## 🚨 Rollback Plan

If critical issues found after merge:
1. Revert commit: `git revert <commit-hash>`
2. Push to main: `git push origin main`
3. Create hotfix branch if needed
4. Document issue in SPRINT_1_ISSUES.md

---

## ✅ Sign-Off

- [ ] Code review completed by: __________________
- [ ] UX validation by: __________________
- [ ] QA testing by: __________________
- [ ] Approved for merge by: __________________

---

## 📝 Notes

- Sprint 1 is foundational - no UI changes visible to end users
- StudyContext is additive (no breaking changes)
- PatientStatusBadge import path may need updates in other files (check before Sprint 2)
