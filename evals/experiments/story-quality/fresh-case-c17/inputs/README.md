# Fixed source packet FC-C17

This is a historical-vintage exercise, not a claim about the latest population estimates. Use only Vintage 2024 national estimates for annual periods ending July 1, 2021–2024. Later vintages revise these figures and must not be spliced in.

The permitted data source is the frozen U.S. Census Bureau NST-EST2024-ALLDATA CSV. The permitted explanatory sources are the corresponding file layout, December 2024 methods statement and Vintage 2024 release notes PDFs. Their URLs, retrieval results and byte identities are recorded beside this packet. The PDF text files are pdftotext convenience extracts; the PDFs remain authoritative. Failed HTML retrievals are recorded but supply no permitted evidence. No external source is required for the bounded question.

Run `node build.mjs` from this directory to rebuild `data/components.csv` and `components.svg` without network access or npm packages. The chart is a custodian reconstruction check, not a completed story or a required editorial design. The CSV uses a July-to-July year, people counts, a share-of-change percentage and a population growth percentage. Those two percentage denominators differ. The national row uses SUMLEV=010, STATE=00; Puerto Rico is separately reported and is not an extra row to add to the national estimate.

The sources identify estimated demographic components, not a policy experiment. The release notes describe an estimation adjustment that affects the migration series; that is usable attributed measurement evidence. They do not identify a policy effect or establish which portion of the within-vintage annual increase represents measurement change versus changes in actual migration.

## Provenance and rights

Producer: U.S. Census Bureau, Population Division. Published December 2024; retrieved 30 October 2026. Cite: U.S. Census Bureau, Vintage 2024 Population Estimates, NST-EST2024-ALLDATA; accompanying methods statement and release notes. Source URLs appear in `retrieval.json`. These are federal-agency-authored statistical products; no third-party data redistribution restriction was found in the retrieved documents. A source-specific redistribution licence was not stated in the PDFs/CSV. The attempted Census copyright HTML page returned HTTP 403; its text was not verified. Metadata therefore records “No licence stated in retrieved documents”, not a falsely verified CC licence. This local evaluation packet has not been published. Any later distribution should retain attribution and this rights qualification.
