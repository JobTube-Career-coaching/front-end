import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

function App() {
    const [keyword, setKeyword] = useState('');
    const [videos, setVideos] = useState([]);
    const [summaries, setSummaries] = useState({});
    const [activeMenu, setActiveMenu] = useState('search');
    const [favorites, setFavorites] = useState([]);
    const [filteredFavorites, setFilteredFavorites] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // 검색된 비디오
    const searchVideos = async () => {
        try {
            const response = await axios.get(`http://localhost:8000/search?keyword=${keyword}`);
            setVideos(response.data);
            setSummaries({});
        } catch (error) {
            console.error('Error searching videos:', error);
            setVideos([]);
        }
    };

    const [filters, setFilters] = useState({
        title: '',
        recrutSe: '전체보기',               // 공고구분
        workRgnLst: '전체보기',             // 근무지역목록
        acbgCondLst: '전체보기',            // 학력조건목록
        hireTypeLst: '전체보기',            // 고용유형목록
        ncsCdLst: '전체보기',               // NCS코드목록
    });

    const [appliedFilters, setAppliedFilters] = useState(null);

    // 초기 데이터 가져오기
    useEffect(() => {
        fetchFavorites();
    }, []);

    // 필터 값 변경
    const handleFilterChange = (key, value) => {
        if (value === "전체보기") {
            // '전체보기' 선택 시 모든 옵션 값을 동적으로 설정
            const allValues = getAllOptionsForKey(key); // 각 필터 옵션 값을 가져오는 함수 호출
            setFilters((prevFilters) => ({
                ...prevFilters,
                [key]: allValues,
            }));
        } else {
            // 개별 값이 선택되었을 때 해당 값만 설정
            setFilters((prevFilters) => ({
                ...prevFilters,
                [key]: value,
            }));
        }
    };

    // 각 필터의 모든 옵션 값을 반환하는 헬퍼 함수
    const getAllOptionsForKey = (key) => {
        const options = {
            recrutSe: ["R2010", "R2020", "R2030", "R2040"],
            workRgnLst: [
                "R3010", "R3011", "R3012", "R3013", "R3014", "R3015",
                "R3016", "R3017", "R3018", "R3019", "R3020", "R3021",
                "R3022", "R3023", "R3024", "R3025", "R3026", "R3030"
            ],
            acbgCondLst: ["R7010", "R7020", "R7030", "R7040", "R7050", "R7060", "R7070"],
            hireTypeLst: ["R1010", "R1020", "R1030", "R1040", "R1050", "R1060", "R1070"],
            ncsCdLst: [
                "R600001", "R600002", "R600003", "R600004", "R600005",
                "R600006", "R600007", "R600008", "R600009", "R600010",
                "R600011", "R600012", "R600013", "R600014", "R600015",
                "R600016", "R600017", "R600018", "R600019", "R600020",
                "R600021", "R600022", "R600023", "R600024", "R600025"
            ],
        };

        return options[key] || []; // 필터 키에 따른 옵션 리스트 반환
    };



    const fetchFavorites = async () => {
        try {
            const response = await axios.get('http://apis.data.go.kr/1051000/recruitment/list', {
                params: { serviceKey: 'OU7Aa5bKI3fElL2xe6eU+Z9WCdjEtS+8FU0jVhHlJmWNn7wg7lCcgLRkBY5IVqj4jm7tJN1EpaOyeGd+McrXog==' },
            });

            // API 응답 데이터 확인
            console.log('API Response:', response.data);

            // 데이터 구조에 맞게 처리
            const data = response.data.result || []; // API 응답에서 'result'를 가져옴. 없으면 빈 배열.
            setFavorites(data);
            setFilteredFavorites(data);
        } catch (error) {
            console.error('Error fetching favorites:', error);
        }
    };

    const applyFilters = () => {
        const filtered = favorites.filter((item) => {
            const { title, recrutSe, workRgnLst, acbgCondLst, hireTypeLst, ncsCdLst } = filters;

            // 안전한 데이터 접근 및 필터 조건 적용
            return (
                (title === '' || (item.recrutPbancTtl || '').includes(title)) &&
                (recrutSe === '전체보기' || item.recrutSeNm === recrutSe) &&
                (workRgnLst === '전체보기' || (item.workRgnNmLst || []).includes(workRgnLst)) &&
                (acbgCondLst === '전체보기' || (item.acbgCondNmLst || []).includes(acbgCondLst)) &&
                (hireTypeLst === '전체보기' || (item.hireTypeNmLst || []).includes(hireTypeLst)) &&
                (ncsCdLst === '전체보기' || (item.ncsCdNmLst || []).includes(ncsCdLst))
            );
        });

        setFilteredFavorites(filtered);
        setAppliedFilters(filters);
        setCurrentPage(1); // 필터 적용시 첫 페이지로 리셋
    };


    // 필터 초기화
    const resetFilters = () => {
        setFilters({
            title: '',
            recrutSe: '전체보기',
            workRgnLst: '전체보기',
            acbgCondLst: '전체보기',
            hireTypeLst: '전체보기',
            ncsCdLst: '전체보기',
        });
        setFilteredFavorites(favorites);
        setAppliedFilters(null);
        setCurrentPage(1); // 필터 초기화 시 첫 페이지로 리셋
    };

    // 페이지네이션 처리
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentItems = filteredFavorites.slice(startIndex, startIndex + itemsPerPage);

    const handlePrevPage = () => {
        if (currentPage > 1) setCurrentPage((prev) => prev - 1);
    };

    const handleNextPage = () => {
        if (currentPage < Math.ceil(filteredFavorites.length / itemsPerPage)) {
            setCurrentPage((prev) => prev + 1);
        }
    };

    return (
        <div className="App">
            <div className="sidebar">
                <h2>메뉴</h2>
                <ul>
                    <li onClick={() => setActiveMenu('search')} className={activeMenu === 'search' ? 'active' : ''}>
                        문서 분석
                    </li>
                    <li onClick={() => setActiveMenu('favorites')} className={activeMenu === 'favorites' ? 'active' : ''}>
                        취업 공고
                    </li>
                </ul>
            </div>

            <div className="content">
                <header className="header">
                    <h1>JobTube</h1>
                </header>

                {activeMenu === 'search' && (
                    <div className="search-section">
                        <input
                            type="text"
                            placeholder="키워드 입력"
                            value={keyword}
                            onChange={(e) => setKeyword(e.target.value)}
                            className="search-input"
                        />
                        <button onClick={searchVideos} className="search-button">검색</button>
                    </div>
                )}

                {activeMenu === 'favorites' && (
                    <div>
                        <div className="filter-section">
                            <h2>검색 및 필터링</h2>
                            <div className="filter-controls">
                                <div>
                                    <label>공고 제목</label>
                                    <input
                                        type="text"
                                        placeholder="공고 제목을 입력해주세요."
                                        value={filters.title}
                                        onChange={(e) => handleFilterChange('title', e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label>채용 구분</label>
                                    <select
                                        value={filters.recrutSe}
                                        onChange={(e) => handleFilterChange('recrutSe', e.target.value)}
                                    >
                                        <option value="전체보기">전체보기</option>
                                        <option value="R2010">신입</option>
                                        <option value="R2020">경력</option>
                                        <option value="R2030">신입+경력</option>
                                        <option value="R2040">외국인 전형</option>
                                    </select>
                                </div>
                                <div>
                                    <label>근무지</label>
                                    <select
                                        value={filters.workRgnLst}
                                        onChange={(e) => handleFilterChange('workRgnLst', e.target.value)}
                                    >
                                        <option value="전체보기">전체보기</option>
                                        <option value="R3010">서울</option>
                                        <option value="R3011">인천</option>
                                        <option value="R3012">대전</option>
                                        <option value="R3013">대구</option>
                                        <option value="R3014">부산</option>
                                        <option value="R3015">광주</option>
                                        <option value="R3016">울산</option>
                                        <option value="R3017">경기</option>
                                        <option value="R3018">강원</option>
                                        <option value="R3019">충남</option>
                                        <option value="R3020">충북</option>
                                        <option value="R3021">경북</option>
                                        <option value="R3022">경남</option>
                                        <option value="R3023">전남</option>
                                        <option value="R3024">전북</option>
                                        <option value="R3025">제주</option>
                                        <option value="R3026">세종</option>
                                        <option value="R3030">해외</option>
                                    </select>
                                </div>
                                <div>
                                    <label>학력</label>
                                    <select
                                        value={filters.acbgCondLst}
                                        onChange={(e) => handleFilterChange('acbgCondLst', e.target.value)}
                                    >
                                        <option value="전체보기">전체보기</option>
                                        <option value="R7010">학력무관</option>
                                        <option value="R7020">중졸이하</option>
                                        <option value="R7030">고졸</option>
                                        <option value="R7040">대졸(2~3년)</option>
                                        <option value="R7050">대졸(4년)</option>
                                        <option value="R7060">석사</option>
                                        <option value="R7070">박사</option>
                                    </select>
                                </div>
                                <div>
                                    <label>고용형태</label>
                                    <select
                                        value={filters.hireTypeLst}
                                        onChange={(e) => handleFilterChange('hireTypeLst', e.target.value)}
                                    >
                                        <option value="전체보기">전체보기</option>
                                        <option value="R1010">정규직</option>
                                        <option value="R1020">계약직</option>
                                        <option value="R1030">무기계약직</option>
                                        <option value="R1040">비정규직</option>
                                        <option value="R1050">청년인턴</option>
                                        <option value="R1060">청년인턴(체험형)</option>
                                        <option value="R1070">청년인턴(채용형)</option>
                                    </select>
                                </div>
                                <div>
                                    <label>NCS 코드</label>
                                    <select
                                        value={filters.ncsCdLst}
                                        onChange={(e) => handleFilterChange('ncsCdLst', e.target.value)}
                                    >
                                        <option value="전체보기">전체보기</option>
                                        <option value="R600001">사업관리</option>
                                        <option value="R600002">경영.회계.사무</option>
                                        <option value="R600003">금융.보험</option>
                                        <option value="R600004">교육.자연.사회과학</option>
                                        <option value="R600005">법률.경찰.소방.교도.국방</option>
                                        <option value="R600006">보건.의료</option>
                                        <option value="R600007">사회복지.종교</option>
                                        <option value="R600008">문화.예술.디자인.방송</option>
                                        <option value="R600009">운전.운송</option>
                                        <option value="R600010">영업판매</option>
                                        <option value="R600011">경비.청소</option>
                                        <option value="R600012">이용.숙박.여행.오락.스포츠</option>
                                        <option value="R600013">음식서비스</option>
                                        <option value="R600014">건설</option>
                                        <option value="R600015">기계</option>
                                        <option value="R600016">재료</option>
                                        <option value="R600017">화학</option>
                                        <option value="R600018">섬유.의복</option>
                                        <option value="R600019">전기.전자</option>
                                        <option value="R600020">정보통신</option>
                                        <option value="R600021">식품가공</option>
                                        <option value="R600022">인쇄.목재.가구.공예</option>
                                        <option value="R600023">환경.에너지.안전</option>
                                        <option value="R600024">농림어업</option>
                                        <option value="R600025">연구</option>
                                    </select>
                                </div>
                            </div>
                            <div className="filter-buttons">
                                <button onClick={applyFilters}>필터 적용</button>
                                <button onClick={resetFilters}>필터 초기화</button>
                            </div>
                        </div>

                        {activeMenu === 'favorites' && (
                            <div className="favorites-section">
                                <h2>취업 공고</h2>
                                {favorites.length > 0 ? (
                                    <div>
                                        <table className="favorites-table">
                                            <thead>
                                                <tr>
                                                    <th>공시기관</th>
                                                    <th>공고</th>
                                                    <th>채용구분</th>
                                                    <th>고용형태</th>
                                                    <th>근무지</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {currentItems.map((item, index) => (
                                                    <tr key={index}>
                                                        <td>{item.instNm || '정보 없음'}</td>
                                                        <td>{item.recrutPbancTtl || '정보 없음'}</td>
                                                        <td>{item.recrutSeNm || '정보 없음'}</td>
                                                        <td>{item.hireTypeNmLst || '정보 없음'}</td>
                                                        <td>{item.workRgnNmLst || '정보 없음'}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>

                                        <div className="pagination">
                                            <button onClick={handlePrevPage} disabled={currentPage === 1}>
                                                이전
                                            </button>
                                            <span>
                                                {currentPage} / {Math.ceil(favorites.length / itemsPerPage)}
                                            </span>
                                            <button
                                                onClick={handleNextPage}
                                                disabled={currentPage === Math.ceil(favorites.length / itemsPerPage)}
                                            >
                                                다음
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <p>데이터를 불러오는 중이거나 공고가 없습니다.</p>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export default App;
