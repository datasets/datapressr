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

	fmt.Printf("Created dataset '%s' at ./%s/\n", name, name)
	fmt.Println("  datapackage.json")
	fmt.Println("  data/")
	return nil
}
