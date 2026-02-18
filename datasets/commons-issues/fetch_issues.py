#!/usr/bin/env python3
"""Fetch all GitHub issues and save as markdown files with frontmatter."""

import json
import re
import subprocess
import sys
from pathlib import Path

OUTPUT_DIR = Path(__file__).parent


def slugify(text):
    text = text.lower()
    text = re.sub(r'[^\w\s-]', '', text)
    text = re.sub(r'[\s_]+', '-', text)
    text = re.sub(r'-+', '-', text)
    return text.strip('-')[:60]


def yaml_str(value):
    """Safely encode a string value for YAML frontmatter."""
    if value is None:
        return 'null'
    # If contains special chars, wrap in double quotes and escape
    if any(c in str(value) for c in [':', '#', '[', ']', '{', '}', '>', '|', '&', '*', '!', "'", '"', '\n']):
        return '"' + str(value).replace('\\', '\\\\').replace('"', '\\"').replace('\n', '\\n') + '"'
    return str(value)


def format_issue(issue):
    number = issue['number']
    title = issue['title']
    state = issue['state'].lower()
    author = issue.get('author', {}) or {}
    author_login = author.get('login', '')
    created_at = issue.get('createdAt', '')
    updated_at = issue.get('updatedAt', '')
    closed_at = issue.get('closedAt', '')
    labels = [l['name'] for l in (issue.get('labels') or [])]
    assignees = [a['login'] for a in (issue.get('assignees') or [])]
    milestone = issue.get('milestone')
    milestone_title = milestone['title'] if milestone else ''
    body = issue.get('body') or ''
    comments = issue.get('comments') or []

    # Build frontmatter
    fm_lines = ['---']
    fm_lines.append(f'number: {number}')
    fm_lines.append(f'title: {yaml_str(title)}')
    fm_lines.append(f'state: {state}')
    fm_lines.append(f'author: {yaml_str(author_login)}')
    fm_lines.append(f'created_at: {yaml_str(created_at)}')
    fm_lines.append(f'updated_at: {yaml_str(updated_at)}')
    if closed_at:
        fm_lines.append(f'closed_at: {yaml_str(closed_at)}')
    if labels:
        fm_lines.append(f'labels: [{", ".join(yaml_str(l) for l in labels)}]')
    else:
        fm_lines.append('labels: []')
    if assignees:
        fm_lines.append(f'assignees: [{", ".join(yaml_str(a) for a in assignees)}]')
    if milestone_title:
        fm_lines.append(f'milestone: {yaml_str(milestone_title)}')
    fm_lines.append('---')

    parts = ['\n'.join(fm_lines), '']
    parts.append(f'# {title}')
    parts.append('')

    if body.strip():
        parts.append(body.strip())
        parts.append('')

    if comments:
        parts.append('## Comments')
        parts.append('')
        for comment in comments:
            c_author = (comment.get('author') or {}).get('login', 'unknown')
            c_date = comment.get('createdAt', '')
            c_body = comment.get('body') or ''
            parts.append(f'### {c_author} ({c_date})')
            parts.append('')
            if c_body.strip():
                parts.append(c_body.strip())
                parts.append('')

    return '\n'.join(parts)


def main():
    print("Fetching all issues from GitHub...", flush=True)

    result = subprocess.run(
        [
            'gh', 'issue', 'list',
            '--state', 'all',
            '--limit', '1000',
            '--json', 'number,title,state,author,createdAt,updatedAt,closedAt,labels,assignees,milestone,body,comments',
        ],
        capture_output=True, text=True
    )

    if result.returncode != 0:
        print(f"Error: {result.stderr}", file=sys.stderr)
        sys.exit(1)

    issues = json.loads(result.stdout)
    print(f"Found {len(issues)} issues. Writing markdown files...", flush=True)

    for issue in issues:
        number = issue['number']
        slug = slugify(issue['title'])
        filename = f"{number}-{slug}.md"
        filepath = OUTPUT_DIR / filename

        content = format_issue(issue)
        filepath.write_text(content, encoding='utf-8')
        print(f"  wrote {filename}")

    print(f"\nDone. {len(issues)} files written to {OUTPUT_DIR}/")


if __name__ == '__main__':
    main()
