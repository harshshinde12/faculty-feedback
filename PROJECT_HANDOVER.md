# Faculty Feedback System - Project Handover

## 1. Application Overview
This is a **Faculty Feedback System** designed for educational institutions. It facilitates the collection and analysis of student feedback for faculty members.

*   **Admin**: Manages Departments, Programs, Subjects, Users, and creates Feedback Forms.
*   **Student**: Logs in to submit feedback for their respective subjects.
*   **Faculty**: Views feedback analytics for the subjects they teach.
*   **HOD (Head of Dept)**: Views comparative analytics for all faculty members in their department.

## 2. Technology Stack
*   **Framework**: [Next.js 14 (App Router)](https://nextjs.org/)
*   **Language**: TypeScript
*   **Database**: MongoDB (via Mongoose)
*   **Styling**: Tailwind CSS
*   **Authentication**: NextAuth.js
*   **Visualization**: Recharts (for analytics charts)

## 3. Features Implemented & Refined
We have recently focused on stabilizing core workflows and enhancing the analytics experience:

1.  **Bug Fix: Cascading Dropdowns**:
    *   Fixed the "Create Targeted Feedback Form" page where the **Year dropdown** was not populating.
    *   *Solution*: Implemented reliable data normalization for `academicYears`, handling disparate data formats (arrays vs. comma-separated strings) stored in the database.
2.  **Feature: Analytics Visualization**:
    *   **Faculty Dashboard**: Added Bar Charts (Avg Rating) and Pie Charts (Rating Distribution) for subject-specific insights.
    *   **HOD Dashboard**: Added comparative Bar Charts to view Faculty Performance vs. Peers and Subject-wise averages.
3.  **Data Seeding Scripts**:
    *   Created `seed.ts` (Base structure) and `seed_responses.ts` (Mock feedback data) to facilitate rapid testing.

## 4. Areas for Improvement (Next Steps)
The following areas require attention from the development team:

*   **Mobile Responsiveness**: complex tables in the Admin and HOD dashboards need better mobile optimization (e.g., horizontal scrolling or card layouts).
*   **Strict Data Validation**:
    *   Enforce `academicYears` as an `Array` at the Mongoose schema level to prevent future data inconsistencies.
    *   Add validation middleware for API routes to ensure robust error handling.
*   **Security Review**: Review API route protections to ensure all admin/analytics endpoints are strictly gated by `NextAuth` roles.

## 5. Data Requirements (Data Feeding)
For the application to function correctly in production, data must be fed/seeded in this specific order:

1.  **Departments & Programs**: Define these first (e.g., "Computer Engineering", "B.Tech").
2.  **Subjects**: Create subjects and link them to Programs/Semesters.
3.  **Users**: Create Faculty and Student accounts.
4.  **Mappings (CRITICAL)**: You **MUST** create entries in the `Mappings` collection. This links a **Faculty** member to a **Subject** for a specific **Class/Division**. without this, specific feedback forms cannot be created.
5.  **Feedback Responses**: Charts will remain empty until students actually submit forms.
