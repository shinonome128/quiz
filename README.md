# クイズアプリ

セールスフォースのスクラッチ組織やハンズオン組織で動くクイズアプリです。

統計情報に基づいて問題をフィルタしたり英訳したり、Gemini に回答を聞いたりできます。

Quizlet やサイト上の問題だと使いにくい、仕様とデータを自分で調整したい方には、Apex と LWC で書かれているので自由に改造することができます。

サンプル問題が入ったデモサイトです、実際に触ってみて下さい。

https://playful-otter-hhv0qt-dev-ed.trailblaze.my.site.com/s/

## 目次

-   [スクラッチ組織へのインスト手順](#スクラッチ組織へのインスト手順)

-   [トレールヘッドハンズオン組織へのインスト手順](#トレールヘッドハンズオン組織へのインスト手順)

-   [問題集データをインポート](#問題集データをインポート)

-   [多人数モード切り替えについて](#多人数モード切り替えについて)

-   [複数の問題集を動画カルーセルで切り替え](#複数の問題集を動画カルーセルで切り替え)

## スクラッチ組織へのインスト手順

1. トレールヘッドで検証用のハンズオン組織を作成

    [トレールヘッドアカウントでログインするとプロファイルから検証環境が作成できる](https://trailhead.salesforce.com/ja/users/profiles/orgs)

    組織作成したらパスワードリセットしてユーザ名とパスワードでログインできるようにしておく

    組織作成したら DevHub を有効化しておく

1. Git と SFDX を用意

    [Git インスト](https://git-scm.com/book/ja/v2/%E4%BD%BF%E3%81%84%E5%A7%8B%E3%82%81%E3%82%8B-Git%E3%81%AE%E3%82%A4%E3%83%B3%E3%82%B9%E3%83%88%E3%83%BC%E3%83%AB)

    [SFDX インスト](https://developer.salesforce.com/docs/atlas.ja-jp.sfdx_setup.meta/sfdx_setup/sfdx_setup_install_cli.htm)

1. Git クローン

    [Git の個人アクセストークン(phg_XXX の部分)を設定](https://docs.github.com/ja/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token)

    ```
    git clone https://ghp_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX@github.com/FLECT-DEV-TEAM/quiz.git
    cd quiz
    ```

1. SFDX プロジェクト作成

    ```
    sfdx force:project:create -n ./ --template standard
    ```

1. SFDX でハンズオン組織にログイン

    ```
    sfdx auth:web:login -d -a myhuborg
    ```

1. スクラッチ組織作成

    ```
    sfdx force:org:create -s -f config/project-scratch-def.json -a quiz
    ```

1. メタとソースをデプロイ

    ```
    sfdx project deploy start -c -o quiz
    ```

1. ゲストプロファイルのメタをデプロイ

    ```
    sfdx project deploy start --metadata-dir=guest-profile-metadata -w 50
    ```

1. 権限セット **quiz** をログインユーザに適用

    ```
    sfdx force:user:permset:assign -n quiz
    ```

1. コミュニティサイトを有効化

    ```
    sfdx community publish -n Quiz
    ```

1. ハンズオン組織を開く

    ```
    sfdx force:org:open
    ```

1. アプリケーションランチャーから **Quiz** アプリを選択

 <img src="./image/quiz.png" width="300">

## トレールヘッドハンズオン組織へのインスト手順

1. トレールヘッドで検証用のハンズオン組織を作成

    [トレールヘッドアカウントでログインするとプロファイルから検証環境が作成できる](https://trailhead.salesforce.com/ja/users/profiles/orgs)

    組織作成したらパスワードリセットしてユーザ名とパスワードでログインできるようにしておく

1. Git と SFDX を用意

    [Git インスト](https://git-scm.com/book/ja/v2/%E4%BD%BF%E3%81%84%E5%A7%8B%E3%82%81%E3%82%8B-Git%E3%81%AE%E3%82%A4%E3%83%B3%E3%82%B9%E3%83%88%E3%83%BC%E3%83%AB)

    [SFDX インスト](https://developer.salesforce.com/docs/atlas.ja-jp.sfdx_setup.meta/sfdx_setup/sfdx_setup_install_cli.htm)

1. Git クローン

    [Git の個人アクセストークン(phg_XXX の部分)を設定](https://docs.github.com/ja/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token)

    ```
    git clone https://ghp_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX@github.com/FLECT-DEV-TEAM/quiz.git
    cd quiz
    ```

1. SFDX プロジェクト作成

    ```
    sfdx force:project:create -n ./ --template standard
    ```

1. SFDX でハンズオン組織にログイン

    ```
    sfdx auth:web:login -s -a mydevorg
    ```

1. デジタルエクスペリエスちメタデータ API を有効化

    1. **設定(歯車アイコン)**, **クイック検索** から **デジタルエクスペリエンス** を選択
    1. **デジタルエクスペリエンスを有効化** をチェックして保存
    1. **設定(歯車アイコン)**, **クイック検索** から **デジタルエクスペリエンス** 配下の **設定** を選択
    1. **ExperienceBundle メタデータ API を有効化** をチェックして保存

1. エクスペリエンスクラウドのメタファイルを編集

    1. `force-app/main/default/sites/Quiz.site-meta.xml` ファイルを開く
    1. `<siteAdmin>` タグのユーザ名をプレイグラウンドのユーザ名に変更
    1. `<siteGuestRecordDefaultOwner>` タグのユーザ名をプレイグラウンドのユーザ名に変更
    1. ファイルを保存

1. メタとソースをデプロイ

    ```
    sfdx project deploy start -d force-app
    ```

1. ゲストプロファイルのメタをデプロイ

    ```
    sfdx project deploy start --metadata-dir=guest-profile-metadata -w 50
    ```

1. 権限セット **quiz** をログインユーザに適用

    ```
    sfdx force:user:permset:assign -n quiz
    ```

1. コミュニティサイトを有効化

    ```
    sfdx community publish -n Quiz
    ```

1. ハンズオン組織を開く

    ```
    sfdx force:org:open
    ```

1. アプリケーションランチャーから **Quiz** アプリを選択

 <img src="./image/quiz.png" width="300">

## 問題集データをインポート

上級 Platform デベロッパー問題集

    sfdx force:data:tree:import -p ./data/pd2-0.json

JavaScript デベロッパー問題集

    sfdx force:data:tree:import -p ./data/jsdev-0.json

Heroku アーキテクト問題集

    sfdx force:data:tree:import -p ./data/heroku-0.json

上級アドミニストレータ問題集

    sfdx force:data:tree:import -p ./data/advAdmin-0.json

Nonprofit Cloud コンサルタント問題集

    sfdx force:data:tree:import -p ./data/npsp-0.json

Education Cloud コンサルタント問題集

    sfdx force:data:tree:import -p ./data/eda-0.json

Experience Cloud コンサルタント問題集

    sfdx force:data:tree:import -p ./data/ec-0.json

Data Cloud コンサルタント問題集

    sfdx force:data:tree:import -p ./data/dc-0.json

MuleSoft デベロッパー問題集

    sfdx force:data:tree:import -p ./data/mcd1-0.json

MuleSoft MCIA問題集

    sfdx force:data:tree:import -p ./data/mcia-0.json

Sales Cloud コンサルタント問題集

    sfdx force:data:tree:import -p ./data/sales-0.json

Service Cloud コンサルタント問題集

    sfdx force:data:tree:import -p ./data/service-0.json

## 多人数モード切り替えについて

多人数モードにしてエクスペリエンスクラウドの URL を共有することでクイズアプリを共有することができます。

エクスペリエンスクラウドのゲストユーザアクセスとブラウザストレージキャッシュを利用して不特定多数のゲストユーザアクセス時にも統計情報を分離することができます。

1. カスタム表示ラベルを編集

    1. `force-app/main/default/labels/CustomLabels.labels-meta.xml` ファイルを開く
    1. `<value>` タグの値を `false` に変更
    1. ファイルを保存

1. カスタム表示ラベルをデプロイ

    ```
    sfdx project deploy start -d force-app/main/default/labels/CustomLabels.labels-meta.xml
    ```

## 複数の問題集を動画カルーセルで切り替え

`Question__c` オブジェクトの `Type__c` 項目で複数の問題集を管理できます。

`Type__c` で問題集を切り替えることで問題集ごとの統計が管理できます。

Experiencer Cloud 画面ホームの動画がカルーセルになっていて、ロゴが `Type__c` の値で表示されます。

ロゴをクリックすると該当の問題集画面に遷移し、動画領域をクリックすると別の `Type__c` の値のロゴに切り替わります。
