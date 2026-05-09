# Google Sheets Setup for the LinkedIn Research Spreadsheet

Use this to turn the CSV into a real working spreadsheet with filters and scoring.

## Step 1: Import the CSV

1. Open Google Sheets.
2. Create a new spreadsheet.
3. Go to **File → Import → Upload**.
4. Upload `03_Company_Research_Sheet_Template.csv`.
5. Choose **Replace current sheet**.
6. Click **Import data**.

## Step 2: Turn on filters

1. Select row 1.
2. Click **Data → Create a filter**.
3. Now you can filter by:
   - Industry
   - Pain Category
   - Total Score
   - Priority
   - Status

## Step 3: Freeze header row

1. Click **View → Freeze → 1 row**.

## Step 4: Sort opportunities

Best view:
1. Filter `Priority` to show only `🔥 High` and `✅ Medium`.
2. Sort `Total Score` from Z → A.
3. Filter `Status` to `Not contacted`.

This gives you the best companies to contact first.

## Step 5: Add dropdowns

Recommended dropdown options:

### Industry
- Clinic
- Dental
- Real Estate
- Restaurant/Catering
- Recruiting
- Logistics
- Construction/Home Services
- E-commerce
- Gym/Fitness
- Beauty/Med Spa
- Accounting
- General SMB

### Evidence Type
- Job post
- Company post
- Founder post
- Hiring trend
- Company page
- Website evidence

### Pain Category
- Admin
- Scheduling
- Customer Support
- Lead Follow-Up
- CRM
- Inventory
- Invoice/Billing
- Recruiting/HR
- Operations
- Growth Bottleneck

### Status
- Not contacted
- Contacted
- Replied
- Report sent
- Call booked
- Proposal sent
- Won
- Lost
- Follow up later

## Step 6: Extend formulas

The CSV includes formulas for the first rows. To use more rows:

1. Click the formula cell in `Total Score`.
2. Drag it down.
3. Click the formula cell in `Priority`.
4. Drag it down.

Formula for Total Score:

```text
=SUM(M2:R2)
```

Formula for Priority:

```text
=IF(S2>=8,"🔥 High",IF(S2>=6,"✅ Medium",IF(S2>=4,"⚠️ Low","❌ Ignore")))
```

## Best daily filter

Use this filter every day:

- `Total Score >= 7`
- `Status = Not contacted`
- `Decision Maker Name is not empty`

Then send outreach to the top 2-5 companies.
