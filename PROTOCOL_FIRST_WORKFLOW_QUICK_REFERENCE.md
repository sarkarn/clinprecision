# Protocol-First Workflow - Quick Reference Guide

## 🎯 Core Principle

**PROTOCOL MUST BE ACTIVATED FIRST, THEN STUDY CAN BE APPROVED**

This is required by FDA and ICH-GCP regulations.

---

## ✅ Correct Workflow Sequence

### Step 1: Protocol Development & Approval
```
Study Status: PROTOCOL_REVIEW
Protocol Version: DRAFT → UNDER_REVIEW → APPROVED
```

1. **Create Protocol Version** (Status: DRAFT)
2. **Submit for Review** → Status becomes UNDER_REVIEW
3. **Approve Protocol** → Status becomes APPROVED
4. **Activate Protocol** ✅ → Status becomes ACTIVE

**Key Point**: You can activate the protocol while study is in PROTOCOL_REVIEW status.

### Step 2: Study Approval
```
Study Status: PROTOCOL_REVIEW
Protocol Version: ACTIVE ✅
```

5. **Navigate to "Publish Study" phase**
6. **Approve Study** → Study status becomes APPROVED

**Required**: Protocol must be ACTIVE before this step.

### Step 3: Study Activation
```
Study Status: APPROVED
Protocol Version: ACTIVE
```

7. **Activate Study** → Study status becomes ACTIVE
8. **Begin Patient Enrollment**

---

## 🚫 Common Mistakes

### ❌ WRONG: Trying to approve study before activating protocol
```
Protocol Version: APPROVED (not activated)
Study Status: PROTOCOL_REVIEW
Action: Try to approve study
Result: ERROR - "Study must have at least one active protocol version"
```

**Fix**: Activate the protocol first, then approve the study.

### ❌ WRONG: Trying to activate protocol in PLANNING status
```
Study Status: PLANNING
Protocol Version: APPROVED
Action: Try to activate protocol
Result: ERROR - "Study status is PLANNING (must be PROTOCOL_REVIEW)"
```

**Fix**: Submit study for protocol review first.

---

## 📋 Status Requirements Checklist

### To Activate a Protocol Version:
- [ ] Protocol version status is APPROVED
- [ ] Study status is PROTOCOL_REVIEW, APPROVED, or ACTIVE
- [ ] User has appropriate permissions

### To Approve a Study:
- [ ] Study status is PROTOCOL_REVIEW
- [ ] At least one protocol version is ACTIVE
- [ ] All regulatory documentation complete
- [ ] User has appropriate permissions

---

## 🖥️ UI Guide

### In Protocol Management Page (List View)

**When protocol is APPROVED and study is PROTOCOL_REVIEW**:
- ✅ "Activate" button is **enabled**
- 💡 Click it to activate the protocol

**When protocol is APPROVED but study is PLANNING**:
- ⛔ "Activate" button is **disabled**
- 💡 Tooltip says: "Study must be in Protocol Review phase"
- 🔧 Fix: Submit study for protocol review first

### In Protocol Management Modal

**When protocol is APPROVED and study is PROTOCOL_REVIEW**:
- 📘 **Blue banner** appears: "Next Step: Activate Protocol"
- ✅ "Activate" button is **enabled**
- 💡 Click to finalize the protocol

**When protocol is APPROVED but study is not PROTOCOL_REVIEW**:
- ⚠️ **Amber banner** appears: "Study Not in Protocol Review"
- ⛔ "Activate" button is **disabled**
- 💡 Submit study for protocol review first

### In Publish Study Phase

**When trying to approve study**:
- If no ACTIVE protocol → ❌ Error message
- If ACTIVE protocol exists → ✅ Can approve study

---

## 🔄 Visual Workflow Diagram

```
┌─────────────────────────────────────────────────────┐
│            PROTOCOL DEVELOPMENT PHASE               │
│                                                     │
│  Study: PLANNING → PROTOCOL_REVIEW                 │
│                                                     │
│  Protocol Version Actions:                         │
│  1. Create (DRAFT)                                 │
│  2. Submit (UNDER_REVIEW)                          │
│  3. Approve (APPROVED)                             │
│  4. ⭐ ACTIVATE (ACTIVE) ← KEY STEP!               │
│                                                     │
└─────────────────────────────────────────────────────┘
                          ↓
          Protocol is now ACTIVE ✅
                          ↓
┌─────────────────────────────────────────────────────┐
│              STUDY APPROVAL PHASE                   │
│                                                     │
│  Study: PROTOCOL_REVIEW → APPROVED                 │
│                                                     │
│  Study Actions:                                    │
│  5. Navigate to "Publish Study"                    │
│  6. Approve Study ← Requires active protocol       │
│                                                     │
└─────────────────────────────────────────────────────┘
                          ↓
          Study is now APPROVED ✅
                          ↓
┌─────────────────────────────────────────────────────┐
│             STUDY ACTIVATION PHASE                  │
│                                                     │
│  Study: APPROVED → ACTIVE                          │
│                                                     │
│  7. Activate Study                                 │
│  8. Begin Patient Enrollment                       │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

## 💡 Quick Troubleshooting

### Error: "Study must have at least one active protocol version"

**Problem**: You're trying to approve a study without an active protocol.

**Solution**:
1. Go to Protocol Management
2. Find the APPROVED protocol version
3. Click "Activate"
4. Return to Publish Study
5. Try approving study again

### Error: "Study status is PLANNING (must be PROTOCOL_REVIEW)"

**Problem**: You're trying to activate a protocol too early.

**Solution**:
1. Navigate to "Design Study" phase
2. Complete all study design requirements
3. Submit study for protocol review
4. Return to Protocol Management
5. Try activating protocol again

### Activate button is disabled

**Check**:
- Is protocol status APPROVED? (Must be APPROVED to activate)
- Is study status PROTOCOL_REVIEW or later? (Can't activate in PLANNING)
- Hover over button to see tooltip explanation

---

## 📚 Why This Matters

### Regulatory Compliance

**FDA Requirements**:
- Clinical trials must be conducted per approved protocol
- Protocol defines all study procedures and endpoints
- IRB/EC approves the **protocol document**, not the study concept

**ICH-GCP Guidelines**:
- Protocol is the foundation of good clinical practice
- Study conduct must follow finalized protocol
- Protocol amendments require proper procedures

### Business Impact

**Correct Workflow Ensures**:
- ✅ Regulatory compliance
- ✅ Clear audit trail
- ✅ Proper version control
- ✅ IRB/EC submission readiness
- ✅ Study execution clarity

---

## 🎓 Training Tips

### For Study Managers
1. **Always finalize the protocol first**
   - Complete all protocol sections
   - Get internal approvals
   - **Activate the protocol**

2. **Then proceed with study approval**
   - Verify protocol is active
   - Complete regulatory documentation
   - Approve study for execution

### For Data Managers
- Protocol activation doesn't change any data
- It's a status transition indicating finalization
- Active protocol means "ready for study execution"

### For Regulatory Affairs
- Active protocol status aligns with regulatory submissions
- Matches FDA/ICH-GCP workflow expectations
- Clear documentation trail for audits

---

## ❓ FAQ

**Q: Can I have multiple active protocol versions?**  
A: Yes, but typically you'll have one active version. Additional active versions represent approved amendments.

**Q: What if I need to make protocol changes after activation?**  
A: Create a new protocol version (amendment), go through approval process, and activate the new version.

**Q: Can I revert an activated protocol?**  
A: No. Once activated, protocol versions should remain active until superseded by a newer version. This maintains audit trail integrity.

**Q: What happens to old protocol versions when I activate a new one?**  
A: The old active version becomes SUPERSEDED automatically. The new version becomes ACTIVE.

**Q: Do I need to activate protocol for amendments?**  
A: Yes. Each amendment goes through: DRAFT → UNDER_REVIEW → APPROVED → ACTIVE.

**Q: Can I approve a study with only a SUPERSEDED protocol?**  
A: No. You must have at least one ACTIVE protocol version.

---

## 📞 Getting Help

If you encounter issues with the protocol-first workflow:

1. Check this quick reference guide
2. Review tooltips and UI messages
3. Verify study and protocol statuses
4. Consult with regulatory affairs team
5. Contact system administrators

---

## 🔗 Related Documentation

- [`CRITICAL_WORKFLOW_CORRECTION_FDA_COMPLIANT.md`](./CRITICAL_WORKFLOW_CORRECTION_FDA_COMPLIANT.md) - Complete technical details
- [`STUDY_VS_PROTOCOL_STATUS_EXPLANATION.md`](./STUDY_VS_PROTOCOL_STATUS_EXPLANATION.md) - Status definitions
- [`SUBMIT_FOR_REVIEW_WORKFLOW_GUIDE.md`](./SUBMIT_FOR_REVIEW_WORKFLOW_GUIDE.md) - Submission procedures

---

**Remember**: **PROTOCOL FIRST, STUDY SECOND** - This is not just a system requirement, it's a regulatory mandate!

**Document Version**: 1.0  
**Last Updated**: January 2025  
**Classification**: USER GUIDE - Quick Reference
