package cmd

import (
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"

	"github.com/spf13/cobra"
)

var initFlags struct {
	title       string
	description string
}

var initCmd = &cobra.Command{
	Use:   "init <name>",
	Short: "Scaffold a new dataset directory",
	Long:  "Creates a dataset directory with datapackage.json, data/, and .datahubignore.",
	Args:  cobra.ExactArgs(1),
	RunE:  runInit,
}

func init() {
	initCmd.Flags().StringVarP(&initFlags.title, "title", "t", "", "Dataset title")
	initCmd.Flags().StringVarP(&initFlags.description, "description", "d", "", "Dataset description")
}

func runInit(cmd *cobra.Command, args []string) error {
	name := args[0]
	dir, err := filepath.Abs(name)
	if err != nil {
		return err
	}

	if _, err := os.Stat(dir); err == nil {
		return fmt.Errorf("directory '%s' already exists", name)
	}

	if err := os.MkdirAll(filepath.Join(dir, "data"), 0755); err != nil {
		return err
	}

	dp := map[string]string{"name": name}
	if initFlags.title != "" {
		dp["title"] = initFlags.title
	}
	if initFlags.description != "" {
		dp["description"] = initFlags.description
	}

	dpBytes, _ := json.MarshalIndent(dp, "", "  ")
	if err := os.WriteFile(filepath.Join(dir, "datapackage.json"), append(dpBytes, '\n'), 0644); err != nil {
		return err
	}

	if err := os.WriteFile(filepath.Join(dir, ".datahubignore"), []byte{}, 0644); err != nil {
		return err
	}

	agents := `# Dataset: ` + name + `

This is a [Frictionless Data Package](https://specs.frictionlessdata.io/data-package/).

## Concepts

**Data hierarchy** (from broad to specific):
- **Catalog** = a collection of datasets (maps to a DataHub publication, one GitHub repo)
- **Dataset** = a coherent data concept with a defined schema and coverage — this directory
- **Data file** = a concrete file artifact (csv, json, parquet…) listed as a resource in datapackage.json

**Dataset lifecycle** — a dataset doesn't need to be complete on day one:
- *capture* — just a URL or note, intent to explore
- *stub* — minimal entry: title, description, source link, no files yet
- *archived* — raw files downloaded locally
- *structured* — cleaned, normalised, schema documented
- *enriched* — analysis, visualisations, derived data added
- *monitored* — living source, versioned and updated over time

**Catalog-as-repo pattern**: if the source is a portal or collection containing many datasets (e.g. a data.gov agency, an institutional archive), give it its own repo and DataHub publication — not a subfolder here.

---

## Structure

` + "```" + `
` + name + `/
  datapackage.json   # dataset metadata and resource list
  data/              # data files (csv, json, parquet, etc.)
  .datahubignore     # files to exclude when pushing (gitignore syntax)
` + "```" + `

## datapackage.json

Keep ` + "`resources`" + ` in sync with what's in ` + "`data/`" + `:

` + "```json" + `
{
  "name": "` + name + `",
  "title": "Human readable title",
  "description": "What this dataset is about",
  "resources": [
    {
      "path": "data/my-file.csv",
      "name": "my-file",
      "mediatype": "text/csv"
    }
  ]
}
` + "```" + `

## Workflow

` + "```sh" + `
# Add data files to data/
# Edit datapackage.json — update resources to list them
data pack .   # validate
dh push .     # publish to DataHub
` + "```" + `

## Key rules

- Every file in ` + "`data/`" + ` that you want published must be listed in ` + "`resources`" + `
- ` + "`name`" + ` in datapackage.json must be URL-safe (lowercase, hyphens)
- Use ` + "`.datahubignore`" + ` to exclude scratch files, large intermediaries, etc.
- It is fine to push a stub — set lifecycle stage in ` + "`datapackage.json`" + ` as ` + "`\"status\": \"stub\"`" + ` if incomplete
`

	if err := os.WriteFile(filepath.Join(dir, "AGENTS.md"), []byte(agents), 0644); err != nil {
		return err
	}

	fmt.Printf("Created dataset '%s' at ./%s/\n", name, name)
	fmt.Println("  datapackage.json")
	fmt.Println("  data/")
	fmt.Println("  AGENTS.md")
	return nil
}
