# PRD-07: AI Report Summarizer

## Problem
Finance reports are dense with numbers. Stakeholders (especially non-finance executives) struggle to quickly understand the key takeaways. Manually writing executive summaries is time-consuming and inconsistent.

## Success Criteria
- Users can generate a plain-English summary of any report with one click
- Summaries highlight key insights, risks, and recommendations
- Summary quality is consistent and professional
- Summaries can be edited and included in exports

## Screens & Flows

### Summary Generation (Report Builder Integration)

**Entry Points:**
1. Report Builder toolbar: "✨ Generate Summary" button
2. Report Preview: "Add AI Summary" option
3. Completed Report: "Summarize" action in menu

**Generation Flow:**

1. User clicks "Generate Summary"
2. Modal appears:
   - "Generating executive summary..."
   - Animated progress indicator
   - "This may take 10-20 seconds"
   - Cancel button

3. Summary complete:
   - Summary text displayed in modal
   - Edit textarea (pre-filled with generated text)
   - Tone selector: Professional | Concise | Detailed
   - "Regenerate" button (if unsatisfied)
   - "Insert Summary" primary button
   - "Copy" secondary button

4. Insert adds summary block to top of report

**Summary Block (in Report):**
- Distinct styling (slight background tint, quote mark icon)
- "Executive Summary" heading
- Generated text (editable inline)
- "✨ AI Generated" subtle badge
- Edit | Regenerate | Remove actions

**Interactions:**
- Click "Generate Summary" → starts generation
- Streaming response → text appears progressively
- "Regenerate" → new generation with same data
- Tone change → subtle prompt adjustment, regenerate
- Inline edit → removes "AI Generated" badge

**States:**

*Loading:*
- Modal with pulsing animation
- "Analyzing report data..." text
- Progress bar (indeterminate)

*Error:*
- "Couldn't generate summary. Try again?"
- "Rate limit reached. Please wait 1 minute."
- Retry button

*Empty Report:*
- "Add some modules to your report first"
- Disabled button with tooltip

**Mobile (390px):**
- Full-screen modal for generation
- Summary block full-width
- Touch-friendly edit mode

### Standalone Summarizer (`/ai/summarize`)

**Layout:**
- Textarea for pasting report data / financial text
- Or: Select from existing reports dropdown
- "Summarize" button
- Output area below

**Use Cases:**
- Quick summarization of ad-hoc data
- Summarize external reports (paste from spreadsheet)

## AI Behavior

### Personality
- **Tone**: Sharp, concise financial analyst
- **Audience**: CFO / executive leadership
- **Style**: Insight-first, then supporting data
- **Length**: 150-300 words by default

### Summary Structure
1. **Opening Statement**: Key finding (1 sentence)
2. **Performance Highlights**: 2-3 bullet points
3. **Areas of Concern**: 1-2 bullet points (if any)
4. **Recommendation**: 1 sentence forward-looking

### Example Output
```
Cash position remains strong at $4.3M with 18 months of runway at current burn rate.

**Highlights:**
• Revenue grew 12.4% YoY, exceeding the 10% target
• Engineering came in under budget at 92% utilization
• Customer retention (NDR 114%) continues to drive growth

**Watch Items:**
• Marketing spend is only 45% utilized—opportunity to accelerate growth
• Gross margin at 78.2% is below the 80% target

**Recommendation:** Consider reallocating unused marketing budget to customer acquisition before Q4 close.
```

## Data

### Tables

**ai_summaries**
```sql
id: uuid PK
report_id: uuid FK → reports
user_id: uuid FK → auth.users
content: text NOT NULL
tone: text DEFAULT 'professional' ('professional', 'concise', 'detailed')
is_edited: boolean DEFAULT false
generation_time_ms: int
model_used: text
created_at: timestamptz DEFAULT now()
```

**ai_usage_log** (for rate limiting and analytics)
```sql
id: uuid PK
user_id: uuid FK → auth.users
action: text ('summarize', 'regenerate')
tokens_used: int
created_at: timestamptz DEFAULT now()
```

### Access Rules (RLS)

- Users can CRUD summaries for their own reports
- Managers can view summaries for their department's reports
- Admins can view all summaries

## Edge Cases

| Scenario | Handling |
|----------|----------|
| Report has no data | Show "Add data to your report first" |
| Very large report (50+ modules) | Truncate to most important sections, note in summary |
| AI returns poor quality | "Regenerate" option, tone adjustment |
| Rate limit hit | Show countdown timer, queue request |
| Network timeout | Retry automatically once, then show error |
| User edits then regenerates | Warn: "This will overwrite your edits" |

## Technical Notes

- **Model**: Lovable AI (Google Gemini / GPT-5)
- **Streaming**: Response streams token-by-token for perceived speed
- **Context**: Report modules serialized to prompt (JSON → natural language)
- **Rate Limits**: 10 summaries/hour per user (free), 50/hour (paid)
- **Caching**: Identical report → return cached summary (1 hour TTL)
- **Prompt Engineering**: System prompt defines personality, structure

### Edge Function: `/functions/v1/summarize`

**Input:**
```json
{
  "report_id": "uuid",
  "report_data": { "modules": [...] },
  "tone": "professional"
}
```

**Output (streaming):**
```
data: {"delta": "Cash position "}
data: {"delta": "remains strong "}
...
data: [DONE]
```

## Out of Scope (v2+)

- Multi-language summaries
- Voice narration of summary
- Q&A follow-ups ("What drove the margin decrease?")
- Auto-summarize on report save
- Summary comparison across periods
- Custom personality/tone configuration

## Acceptance Checklist

- [ ] "Generate Summary" button is visible in Report Builder
- [ ] Loading state shows progress indicator
- [ ] Summary streams in progressively (not all at once)
- [ ] Tone selector changes output style
- [ ] "Regenerate" creates new summary
- [ ] Summary block appears at top of report
- [ ] Inline editing works
- [ ] "AI Generated" badge removed after edit
- [ ] Error message is user-friendly
- [ ] Rate limit shows helpful message
- [ ] Works on mobile (full-screen modal)
- [ ] Empty report shows disabled state
- [ ] Summary persists with report save
