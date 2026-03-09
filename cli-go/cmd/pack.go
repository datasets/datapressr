package cmd

import (
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"regexp"
	"strings"

	"github.com/spf13/cobra"
)

var packCmd = &cobra.Command{
	Use:          "pack [dir]",
	Short:        "Validate a dataset directory before publishing",
	Args:         cobra.MaximumNArgs(1),
	RunE:         runPack,
	SilenceUsage: true,
}

func init() {
	rootCmd.AddCommand(packCmd)
}

var urlSafe = regexp.MustCompile(`^[a-z0-9][a-z0-9-]*$`)

const largeFileThreshold = 50 * 1024 * 1024 // 50MB

func runPack(cmd *cobra.Command, args []string) error {
	dir := "."
	if len(args) == 1 {
		dir = args[0]
	}

	absDir, err := filepath.Abs(dir)
	if err != nil {
		return err
	}

	dpPath := filepath.Join(absDir, "datapackage.json")
	data, err := os.ReadFile(dpPath)
	if err != nil {
		return fmt.Errorf("datapackage.json not found in %s", dir)
	}

	var dp map[string]any
	if err := json.Unmarshal(data, &dp); err != nil {
		return fmt.Errorf("datapackage.json is not valid JSON: %w", err)
	}

	var errors []string
	var warnings []string

	// name
	name, _ := dp["name"].(string)
	if name == "" {
		errors = append(errors, "missing required field: name")
	} else if !urlSafe.MatchString(name) {
		errors = append(errors, fmt.Sprintf("name %q is not URL-safe (use lowercase letters, numbers, hyphens only)", name))
	}

	// title / description
	if title, _ := dp["title"].(string); title == "" {
		warnings = append(warnings, "no title — add a human-readable title")
	}
	if desc, _ := dp["description"].(string); desc == "" {
		warnings = append(warnings, "no description — add a short description of the dataset")
	}

	// resources
	resources, _ := dp["resources"].([]any)
	if len(resources) == 0 {
		errors = append(errors, "no resources defined — add a resources array listing your data files")
	} else {
		for i, r := range resources {
			res, ok := r.(map[string]any)
			if !ok {
				errors = append(errors, fmt.Sprintf("resource[%d] is not a valid object", i))
				continue
			}
			path, _ := res["path"].(string)
			if path == "" {
				errors = append(errors, fmt.Sprintf("resource[%d] missing path", i))
				continue
			}
			absPath := filepath.Join(absDir, filepath.FromSlash(path))
			info, err := os.Stat(absPath)
			if err != nil {
				errors = append(errors, fmt.Sprintf("resource %q not found on disk", path))
			} else if info.Size() > largeFileThreshold {
				warnings = append(warnings, fmt.Sprintf("%s is large (%s) — consider whether this should be in .datahubignore", path, formatBytes(info.Size())))
			}
		}
	}

	// warn about files in data/ not listed as resources
	listed := map[string]bool{}
	for _, r := range resources {
		if res, ok := r.(map[string]any); ok {
			if p, ok := res["path"].(string); ok {
				listed[filepath.ToSlash(p)] = true
			}
		}
	}
	dataDir := filepath.Join(absDir, "data")
	if entries, err := os.ReadDir(dataDir); err == nil {
		for _, e := range entries {
			if e.IsDir() {
				continue
			}
			rel := "data/" + e.Name()
			if !listed[rel] {
				warnings = append(warnings, fmt.Sprintf("%s exists in data/ but is not listed in resources", rel))
			}
		}
	}

	// print results
	fmt.Printf("Checking %s\n\n", strings.TrimSuffix(filepath.Base(absDir), "/"))

	if len(errors) == 0 && len(warnings) == 0 {
		fmt.Println("  ✓ All checks passed.")
		return nil
	}

	for _, w := range warnings {
		fmt.Printf("  ⚠  %s\n", w)
	}
	for _, e := range errors {
		fmt.Printf("  ✗  %s\n", e)
	}

	fmt.Println()
	if len(errors) > 0 {
		return fmt.Errorf("%d error(s), %d warning(s)", len(errors), len(warnings))
	}
	fmt.Printf("  %d warning(s) — ok to publish, but worth fixing\n", len(warnings))
	return nil
}
