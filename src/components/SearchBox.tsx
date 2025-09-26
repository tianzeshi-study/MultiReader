import React, { useState } from 'react';
import { 
  IonButton, 
  IonInput, 
  IonModal, 
  IonContent, 
  IonHeader, 
  IonToolbar, 
  IonTitle 
} from '@ionic/react';

interface SearchResult {
  pageIndex: number;
  matchedParagraphs: string[];
}

interface SearchBoxProps {
  htmlArray: string[];
  onPageSelect?: (pageIndex: number) => void; // 搜索结果跳转的回调
}

const SearchBox: React.FC<SearchBoxProps> = ({ htmlArray, onPageSelect }) => {
  const [query, setQuery] = useState<string>('');         // 搜索关键字
  const [results, setResults] = useState<SearchResult[]>([]); // 搜索结果数组
  const [showInput, setShowInput] = useState<boolean>(false); // 是否显示输入框
  const [showModal, setShowModal] = useState<boolean>(false); // 是否显示 Modal

  // 执行搜索操作，遍历 htmlArray 每一页的内容
  const handleSearch = () => {
    console.log("query:", query);
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const newResults: SearchResult[] = htmlArray.map((htmlContent, index) => {
      // 利用 DOMParser 解析 HTML 内容
      const parser = new DOMParser();
      const doc = parser.parseFromString(htmlContent, 'text/html');
      // 获取所有 <p> 元素，并筛选出包含查询关键字的段落
      const paragraphs = Array.from(doc.getElementsByTagName('p'));
      const matchedParagraphs = paragraphs
        .filter(p => p.textContent && p.textContent.includes(query))
        .map(p => p.outerHTML);
      return { pageIndex: index, matchedParagraphs };
    })
    // 过滤掉没有匹配到关键字的页
    .filter(result => result.matchedParagraphs.length > 0);

    setResults(newResults);
    // 打开 Modal 显示搜索结果
    setShowModal(true);
  };

  // 监听输入框的回车事件
  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      // setQuery(event.detail.value!);
      console.log("enter key pressed ");
      handleSearch();
    }
  };

  return (
    <div>
      {/* 初始状态仅显示按钮 */}
      {!showInput && (
        <IonButton onClick={() => setShowInput(true)}>打开搜索</IonButton>
      )}

      {/* 点击按钮后显示输入框和搜索按钮 */}
      {showInput && (
        <div style={{ margin: '1rem 0' }}>
          <IonInput
            value={query}
            placeholder="请输入搜索内容"
            onIonChange={(e) => setQuery(e.detail.value!)}
            onKeyPress={handleKeyPress}
            autoFocus
          />
          <IonButton onClick={handleSearch} style={{ marginLeft: '0.5rem' }}>搜索</IonButton>
        </div>
      )}

      {/* Ionic Modal 显示搜索结果 */}
      <IonModal isOpen={showModal} onDidDismiss={() => setShowModal(false)}>
        <IonHeader>
          <IonToolbar>
            <IonTitle>搜索结果</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent>
          {results.length > 0 ? (
            results.map(result => (
              <div 
                key={result.pageIndex} 
                style={{ padding: '1rem', borderBottom: '1px solid #ccc' }}
              >
                <h3><IonButton 
                  fill="clear" 
                  color="primary" 
                  onClick={() => {
                    if (onPageSelect) {
                      onPageSelect(result.pageIndex);
                    }
                    setShowModal(false);
                  }}
                >
                  第 {result.pageIndex + 1} 页 （点击跳转）
                </IonButton>
                </h3>
                {result.matchedParagraphs.map((paragraph, idx) => (
                  <div key={idx} dangerouslySetInnerHTML={{ __html: paragraph }} />
                ))}
              </div>
            ))
          ) : (
            <div style={{ padding: '1rem' }}>未搜索到匹配项</div>
          )}
          <IonButton expand="block" onClick={() => setShowModal(false)}>
            关闭
          </IonButton>
        </IonContent>
      </IonModal>
    </div>
  );
};

export default SearchBox;
