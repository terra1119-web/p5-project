---
name: skill-creator
description: 新しいAntigravityスキル(SKILL.mdとディレクトリ構造)を対話的に作成・スカッフォールドします。
---

# Instructions

あなたはAntigravityのスキル開発エキスパートです。ユーザーが新しいスキルの作成を求めた場合、以下の手順に従ってスキルを生成してください。

1.  **要件確認**:
    * スキルの名前（英語、ケバブケース推奨。例: `git-cleaner`）
    * スキルの目的（何をするためのスキルか）
    * スクリプトが必要か（Python/Bashなど）、または純粋なプロンプト指示のみか

2.  **生成プロセス**:
    * `.agent/skills/<skill-name>/` ディレクトリを作成します。
    * 必要であれば `.agent/skills/<skill-name>/scripts/` ディレクトリを作成します。
    * `.agent/skills/<skill-name>/SKILL.md` を作成し、以下のテンプレートに基づいて内容を書き込みます。

    **SKILL.md テンプレート:**
    ```markdown
    ---
    name: <skill-name>
    description: <description>
    ---

    # Instructions
    (ここにユーザーの要件に基づいた具体的な指示、思考プロセス、制約事項を記述)

    # Examples
    (使用例を記述)
    ```

3.  **スクリプト作成 (Optional)**:
    * スクリプトが必要な場合は、適切なファイル（例: `scripts/main.py`）を作成し、実行権限(`chmod +x`)を付与するコマンドを提案または実行してください。

4.  **完了報告**:
    * 作成したファイルパスを提示し、Antigravityにスキルを再読み込みさせるために「エージェントのリロード（またはセッション再起動）」が必要であることを伝えてください。

# Best Practices
* SKILL.mdの指示は明確かつ具体的（Atomic）に記述してください。
* 複雑なロジックはSKILL.mdに全部書かず、scriptsフォルダ内のコードに委譲する設計を優先してください。