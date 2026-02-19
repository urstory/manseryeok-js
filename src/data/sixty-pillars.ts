/**
 * 60갑자 데이터
 *
 * 갑자(Gapja)는 천간(10개)과 지지(12개)의 조합으로 만들어지는 60개의 조합입니다.
 * 60년을 주기로 순환하며, 년주/월주/일주 계산에 사용됩니다.
 */

export interface SixtyPillar {
  id: number;             // 0~59
  tiangan: {
    id: number;           // 0~9
    hangul: string;       // 갑, 을, 병, ...
    hanja: string;        // 甲, 乙, 丙, ...
    romanization?: string; // Gap, Eul, Byeong, ... (optional for backward compatibility)
    element: string;      // 오행
  };
  dizhi: {
    id: number;           // 0~11
    hangul: string;       // 자, 축, 인, ...
    hanja: string;        // 子, 丑, 寅, ...
    romanization?: string; // Ja, Chuk, In, ... (optional for backward compatibility)
    animal: string;       // 쥐, 소, 호랑이, ...
    element: string;      // 오행
  };
  combined: {
    hangul: string;       // 갑자, 을축, ...
    hanja: string;        // 甲子, 乙丑, ...
    romanization?: string; // Gapja, Eulchuk, ... (optional for backward compatibility)
  };
  element: string;        // 전체 오행 (천간 기준)
  yinYang: string;        // 음/양
}

/**
 * 60갑자 전체 배열
 */
export const SIXTY_PILLARS: readonly SixtyPillar[] = [
  {
    id: 0,
    tiangan: {
      id: 0,
      hangul: '갑',
      hanja: '甲',
      romanization: 'Gap',
      element: '목'
    },
    dizhi: {
      id: 0,
      hangul: '자',
      hanja: '子',
      romanization: 'Ja',
      animal: '쥐',
      element: '수'
    },
    combined: {
      hangul: '갑자',
      hanja: '甲子',
      romanization: 'Gapja'
    },
    element: '목',
    yinYang: '양'
  },
  {
    id: 1,
    tiangan: {
      id: 1,
      hangul: '을',
      hanja: '乙',
      romanization: 'Eul',
      element: '목'
    },
    dizhi: {
      id: 1,
      hangul: '축',
      hanja: '丑',
      romanization: 'Chuk',
      animal: '소',
      element: '토'
    },
    combined: {
      hangul: '을축',
      hanja: '乙丑',
      romanization: 'Eulchuk'
    },
    element: '목',
    yinYang: '음'
  },
  {
    id: 2,
    tiangan: {
      id: 2,
      hangul: '병',
      hanja: '丙',
      romanization: 'Byeong',
      element: '화'
    },
    dizhi: {
      id: 2,
      hangul: '인',
      hanja: '寅',
      romanization: 'In',
      animal: '호랑이',
      element: '목'
    },
    combined: {
      hangul: '병인',
      hanja: '丙寅',
      romanization: 'Byeongin'
    },
    element: '화',
    yinYang: '양'
  },
  {
    id: 3,
    tiangan: {
      id: 3,
      hangul: '정',
      hanja: '丁',
      romanization: 'Jeong',
      element: '화'
    },
    dizhi: {
      id: 3,
      hangul: '묘',
      hanja: '卯',
      romanization: 'Myo',
      animal: '토끼',
      element: '목'
    },
    combined: {
      hangul: '정묘',
      hanja: '丁卯',
      romanization: 'Jeongmyo'
    },
    element: '화',
    yinYang: '음'
  },
  {
    id: 4,
    tiangan: {
      id: 4,
      hangul: '무',
      hanja: '戊',
      romanization: 'Mu',
      element: '토'
    },
    dizhi: {
      id: 4,
      hangul: '진',
      hanja: '辰',
      romanization: 'Jin',
      animal: '용',
      element: '토'
    },
    combined: {
      hangul: '무진',
      hanja: '戊辰',
      romanization: 'Mujin'
    },
    element: '토',
    yinYang: '양'
  },
  {
    id: 5,
    tiangan: {
      id: 5,
      hangul: '기',
      hanja: '己',
      romanization: 'Gi',
      element: '토'
    },
    dizhi: {
      id: 5,
      hangul: '사',
      hanja: '巳',
      romanization: 'Sa',
      animal: '뱀',
      element: '화'
    },
    combined: {
      hangul: '기사',
      hanja: '己巳',
      romanization: 'Gisa'
    },
    element: '토',
    yinYang: '음'
  },
  {
    id: 6,
    tiangan: {
      id: 6,
      hangul: '경',
      hanja: '庚',
      romanization: 'Gyeong',
      element: '금'
    },
    dizhi: {
      id: 6,
      hangul: '오',
      hanja: '午',
      romanization: 'O',
      animal: '말',
      element: '화'
    },
    combined: {
      hangul: '경오',
      hanja: '庚午',
      romanization: 'Gyeongo'
    },
    element: '금',
    yinYang: '양'
  },
  {
    id: 7,
    tiangan: {
      id: 7,
      hangul: '신',
      hanja: '辛',
      romanization: 'Sin',
      element: '금'
    },
    dizhi: {
      id: 7,
      hangul: '미',
      hanja: '未',
      romanization: 'Mi',
      animal: '양',
      element: '토'
    },
    combined: {
      hangul: '신미',
      hanja: '辛未',
      romanization: 'Sinmi'
    },
    element: '금',
    yinYang: '음'
  },
  {
    id: 8,
    tiangan: {
      id: 8,
      hangul: '임',
      hanja: '壬',
      romanization: 'Im',
      element: '수'
    },
    dizhi: {
      id: 8,
      hangul: '신',
      hanja: '申',
      romanization: 'Sin',
      animal: '원숭이',
      element: '금'
    },
    combined: {
      hangul: '임신',
      hanja: '壬申',
      romanization: 'Imsin'
    },
    element: '수',
    yinYang: '양'
  },
  {
    id: 9,
    tiangan: {
      id: 9,
      hangul: '계',
      hanja: '癸',
      romanization: 'Gye',
      element: '수'
    },
    dizhi: {
      id: 9,
      hangul: '유',
      hanja: '酉',
      romanization: 'Yu',
      animal: '닭',
      element: '금'
    },
    combined: {
      hangul: '계유',
      hanja: '癸酉',
      romanization: 'Gyeyu'
    },
    element: '수',
    yinYang: '음'
  },
  {
    id: 10,
    tiangan: {
      id: 0,
      hangul: '갑',
      hanja: '甲',
      romanization: 'Gap',
      element: '목'
    },
    dizhi: {
      id: 10,
      hangul: '술',
      hanja: '戌',
      romanization: 'Sul',
      animal: '개',
      element: '토'
    },
    combined: {
      hangul: '갑술',
      hanja: '甲戌',
      romanization: 'Gapsul'
    },
    element: '목',
    yinYang: '양'
  },
  {
    id: 11,
    tiangan: {
      id: 1,
      hangul: '을',
      hanja: '乙',
      romanization: 'Eul',
      element: '목'
    },
    dizhi: {
      id: 11,
      hangul: '해',
      hanja: '亥',
      romanization: 'Hae',
      animal: '돼지',
      element: '수'
    },
    combined: {
      hangul: '을해',
      hanja: '乙亥',
      romanization: 'Eulhae'
    },
    element: '목',
    yinYang: '음'
  },
  {
    id: 12,
    tiangan: {
      id: 2,
      hangul: '병',
      hanja: '丙',
      romanization: 'Byeong',
      element: '화'
    },
    dizhi: {
      id: 0,
      hangul: '자',
      hanja: '子',
      romanization: 'Ja',
      animal: '쥐',
      element: '수'
    },
    combined: {
      hangul: '병자',
      hanja: '丙子',
      romanization: 'Byeongja'
    },
    element: '화',
    yinYang: '양'
  },
  {
    id: 13,
    tiangan: {
      id: 3,
      hangul: '정',
      hanja: '丁',
      romanization: 'Jeong',
      element: '화'
    },
    dizhi: {
      id: 1,
      hangul: '축',
      hanja: '丑',
      romanization: 'Chuk',
      animal: '소',
      element: '토'
    },
    combined: {
      hangul: '정축',
      hanja: '丁丑',
      romanization: 'Jeongchuk'
    },
    element: '화',
    yinYang: '음'
  },
  {
    id: 14,
    tiangan: {
      id: 4,
      hangul: '무',
      hanja: '戊',
      romanization: 'Mu',
      element: '토'
    },
    dizhi: {
      id: 2,
      hangul: '인',
      hanja: '寅',
      romanization: 'In',
      animal: '호랑이',
      element: '목'
    },
    combined: {
      hangul: '무인',
      hanja: '戊寅',
      romanization: 'Muin'
    },
    element: '토',
    yinYang: '양'
  },
  {
    id: 15,
    tiangan: {
      id: 5,
      hangul: '기',
      hanja: '己',
      romanization: 'Gi',
      element: '토'
    },
    dizhi: {
      id: 3,
      hangul: '묘',
      hanja: '卯',
      romanization: 'Myo',
      animal: '토끼',
      element: '목'
    },
    combined: {
      hangul: '기묘',
      hanja: '己卯',
      romanization: 'Gimyo'
    },
    element: '토',
    yinYang: '음'
  },
  {
    id: 16,
    tiangan: {
      id: 6,
      hangul: '경',
      hanja: '庚',
      romanization: 'Gyeong',
      element: '금'
    },
    dizhi: {
      id: 4,
      hangul: '진',
      hanja: '辰',
      romanization: 'Jin',
      animal: '용',
      element: '토'
    },
    combined: {
      hangul: '경진',
      hanja: '庚辰',
      romanization: 'Gyeongjin'
    },
    element: '금',
    yinYang: '양'
  },
  {
    id: 17,
    tiangan: {
      id: 7,
      hangul: '신',
      hanja: '辛',
      romanization: 'Sin',
      element: '금'
    },
    dizhi: {
      id: 5,
      hangul: '사',
      hanja: '巳',
      romanization: 'Sa',
      animal: '뱀',
      element: '화'
    },
    combined: {
      hangul: '신사',
      hanja: '辛巳',
      romanization: 'Sinsa'
    },
    element: '금',
    yinYang: '음'
  },
  {
    id: 18,
    tiangan: {
      id: 8,
      hangul: '임',
      hanja: '壬',
      romanization: 'Im',
      element: '수'
    },
    dizhi: {
      id: 6,
      hangul: '오',
      hanja: '午',
      romanization: 'O',
      animal: '말',
      element: '화'
    },
    combined: {
      hangul: '임오',
      hanja: '壬午',
      romanization: 'Imo'
    },
    element: '수',
    yinYang: '양'
  },
  {
    id: 19,
    tiangan: {
      id: 9,
      hangul: '계',
      hanja: '癸',
      romanization: 'Gye',
      element: '수'
    },
    dizhi: {
      id: 7,
      hangul: '미',
      hanja: '未',
      romanization: 'Mi',
      animal: '양',
      element: '토'
    },
    combined: {
      hangul: '계미',
      hanja: '癸未',
      romanization: 'Gyemi'
    },
    element: '수',
    yinYang: '음'
  },
  {
    id: 20,
    tiangan: {
      id: 0,
      hangul: '갑',
      hanja: '甲',
      romanization: 'Gap',
      element: '목'
    },
    dizhi: {
      id: 8,
      hangul: '신',
      hanja: '申',
      romanization: 'Sin',
      animal: '원숭이',
      element: '금'
    },
    combined: {
      hangul: '갑신',
      hanja: '甲申',
      romanization: 'Gapsin'
    },
    element: '목',
    yinYang: '양'
  },
  {
    id: 21,
    tiangan: {
      id: 1,
      hangul: '을',
      hanja: '乙',
      romanization: 'Eul',
      element: '목'
    },
    dizhi: {
      id: 9,
      hangul: '유',
      hanja: '酉',
      romanization: 'Yu',
      animal: '닭',
      element: '금'
    },
    combined: {
      hangul: '을유',
      hanja: '乙酉',
      romanization: 'Eulyu'
    },
    element: '목',
    yinYang: '음'
  },
  {
    id: 22,
    tiangan: {
      id: 2,
      hangul: '병',
      hanja: '丙',
      romanization: 'Byeong',
      element: '화'
    },
    dizhi: {
      id: 10,
      hangul: '술',
      hanja: '戌',
      romanization: 'Sul',
      animal: '개',
      element: '토'
    },
    combined: {
      hangul: '병술',
      hanja: '丙戌',
      romanization: 'Byeongsul'
    },
    element: '화',
    yinYang: '양'
  },
  {
    id: 23,
    tiangan: {
      id: 3,
      hangul: '정',
      hanja: '丁',
      romanization: 'Jeong',
      element: '화'
    },
    dizhi: {
      id: 11,
      hangul: '해',
      hanja: '亥',
      romanization: 'Hae',
      animal: '돼지',
      element: '수'
    },
    combined: {
      hangul: '정해',
      hanja: '丁亥',
      romanization: 'Jeonghae'
    },
    element: '화',
    yinYang: '음'
  },
  {
    id: 24,
    tiangan: {
      id: 4,
      hangul: '무',
      hanja: '戊',
      romanization: 'Mu',
      element: '토'
    },
    dizhi: {
      id: 0,
      hangul: '자',
      hanja: '子',
      romanization: 'Ja',
      animal: '쥐',
      element: '수'
    },
    combined: {
      hangul: '무자',
      hanja: '戊子',
      romanization: 'Muja'
    },
    element: '토',
    yinYang: '양'
  },
  {
    id: 25,
    tiangan: {
      id: 5,
      hangul: '기',
      hanja: '己',
      romanization: 'Gi',
      element: '토'
    },
    dizhi: {
      id: 1,
      hangul: '축',
      hanja: '丑',
      romanization: 'Chuk',
      animal: '소',
      element: '토'
    },
    combined: {
      hangul: '기축',
      hanja: '己丑',
      romanization: 'Gichuk'
    },
    element: '토',
    yinYang: '음'
  },
  {
    id: 26,
    tiangan: {
      id: 6,
      hangul: '경',
      hanja: '庚',
      romanization: 'Gyeong',
      element: '금'
    },
    dizhi: {
      id: 2,
      hangul: '인',
      hanja: '寅',
      romanization: 'In',
      animal: '호랑이',
      element: '목'
    },
    combined: {
      hangul: '경인',
      hanja: '庚寅',
      romanization: 'Gyeongin'
    },
    element: '금',
    yinYang: '양'
  },
  {
    id: 27,
    tiangan: {
      id: 7,
      hangul: '신',
      hanja: '辛',
      romanization: 'Sin',
      element: '금'
    },
    dizhi: {
      id: 3,
      hangul: '묘',
      hanja: '卯',
      romanization: 'Myo',
      animal: '토끼',
      element: '목'
    },
    combined: {
      hangul: '신묘',
      hanja: '辛卯',
      romanization: 'Sinmyo'
    },
    element: '금',
    yinYang: '음'
  },
  {
    id: 28,
    tiangan: {
      id: 8,
      hangul: '임',
      hanja: '壬',
      romanization: 'Im',
      element: '수'
    },
    dizhi: {
      id: 4,
      hangul: '진',
      hanja: '辰',
      romanization: 'Jin',
      animal: '용',
      element: '토'
    },
    combined: {
      hangul: '임진',
      hanja: '壬辰',
      romanization: 'Imjin'
    },
    element: '수',
    yinYang: '양'
  },
  {
    id: 29,
    tiangan: {
      id: 9,
      hangul: '계',
      hanja: '癸',
      romanization: 'Gye',
      element: '수'
    },
    dizhi: {
      id: 5,
      hangul: '사',
      hanja: '巳',
      romanization: 'Sa',
      animal: '뱀',
      element: '화'
    },
    combined: {
      hangul: '계사',
      hanja: '癸巳',
      romanization: 'Gyesa'
    },
    element: '수',
    yinYang: '음'
  },
  {
    id: 30,
    tiangan: {
      id: 0,
      hangul: '갑',
      hanja: '甲',
      romanization: 'Gap',
      element: '목'
    },
    dizhi: {
      id: 6,
      hangul: '오',
      hanja: '午',
      romanization: 'O',
      animal: '말',
      element: '화'
    },
    combined: {
      hangul: '갑오',
      hanja: '甲午',
      romanization: 'Gapo'
    },
    element: '목',
    yinYang: '양'
  },
  {
    id: 31,
    tiangan: {
      id: 1,
      hangul: '을',
      hanja: '乙',
      romanization: 'Eul',
      element: '목'
    },
    dizhi: {
      id: 7,
      hangul: '미',
      hanja: '未',
      romanization: 'Mi',
      animal: '양',
      element: '토'
    },
    combined: {
      hangul: '을미',
      hanja: '乙未',
      romanization: 'Eulmi'
    },
    element: '목',
    yinYang: '음'
  },
  {
    id: 32,
    tiangan: {
      id: 2,
      hangul: '병',
      hanja: '丙',
      romanization: 'Byeong',
      element: '화'
    },
    dizhi: {
      id: 8,
      hangul: '신',
      hanja: '申',
      romanization: 'Sin',
      animal: '원숭이',
      element: '금'
    },
    combined: {
      hangul: '병신',
      hanja: '丙申',
      romanization: 'Byeongsin'
    },
    element: '화',
    yinYang: '양'
  },
  {
    id: 33,
    tiangan: {
      id: 3,
      hangul: '정',
      hanja: '丁',
      romanization: 'Jeong',
      element: '화'
    },
    dizhi: {
      id: 9,
      hangul: '유',
      hanja: '酉',
      romanization: 'Yu',
      animal: '닭',
      element: '금'
    },
    combined: {
      hangul: '정유',
      hanja: '丁酉',
      romanization: 'Jeongyu'
    },
    element: '화',
    yinYang: '음'
  },
  {
    id: 34,
    tiangan: {
      id: 4,
      hangul: '무',
      hanja: '戊',
      romanization: 'Mu',
      element: '토'
    },
    dizhi: {
      id: 10,
      hangul: '술',
      hanja: '戌',
      romanization: 'Sul',
      animal: '개',
      element: '토'
    },
    combined: {
      hangul: '무술',
      hanja: '戊戌',
      romanization: 'Musul'
    },
    element: '토',
    yinYang: '양'
  },
  {
    id: 35,
    tiangan: {
      id: 5,
      hangul: '기',
      hanja: '己',
      romanization: 'Gi',
      element: '토'
    },
    dizhi: {
      id: 11,
      hangul: '해',
      hanja: '亥',
      romanization: 'Hae',
      animal: '돼지',
      element: '수'
    },
    combined: {
      hangul: '기해',
      hanja: '己亥',
      romanization: 'Gihae'
    },
    element: '토',
    yinYang: '음'
  },
  {
    id: 36,
    tiangan: {
      id: 6,
      hangul: '경',
      hanja: '庚',
      romanization: 'Gyeong',
      element: '금'
    },
    dizhi: {
      id: 0,
      hangul: '자',
      hanja: '子',
      romanization: 'Ja',
      animal: '쥐',
      element: '수'
    },
    combined: {
      hangul: '경자',
      hanja: '庚子',
      romanization: 'Gyeongja'
    },
    element: '금',
    yinYang: '양'
  },
  {
    id: 37,
    tiangan: {
      id: 7,
      hangul: '신',
      hanja: '辛',
      romanization: 'Sin',
      element: '금'
    },
    dizhi: {
      id: 1,
      hangul: '축',
      hanja: '丑',
      romanization: 'Chuk',
      animal: '소',
      element: '토'
    },
    combined: {
      hangul: '신축',
      hanja: '辛丑',
      romanization: 'Sinchuk'
    },
    element: '금',
    yinYang: '음'
  },
  {
    id: 38,
    tiangan: {
      id: 8,
      hangul: '임',
      hanja: '壬',
      romanization: 'Im',
      element: '수'
    },
    dizhi: {
      id: 2,
      hangul: '인',
      hanja: '寅',
      romanization: 'In',
      animal: '호랑이',
      element: '목'
    },
    combined: {
      hangul: '임인',
      hanja: '壬寅',
      romanization: 'Imin'
    },
    element: '수',
    yinYang: '양'
  },
  {
    id: 39,
    tiangan: {
      id: 9,
      hangul: '계',
      hanja: '癸',
      romanization: 'Gye',
      element: '수'
    },
    dizhi: {
      id: 3,
      hangul: '묘',
      hanja: '卯',
      romanization: 'Myo',
      animal: '토끼',
      element: '목'
    },
    combined: {
      hangul: '계묘',
      hanja: '癸卯',
      romanization: 'Gyemyo'
    },
    element: '수',
    yinYang: '음'
  },
  {
    id: 40,
    tiangan: {
      id: 0,
      hangul: '갑',
      hanja: '甲',
      romanization: 'Gap',
      element: '목'
    },
    dizhi: {
      id: 4,
      hangul: '진',
      hanja: '辰',
      romanization: 'Jin',
      animal: '용',
      element: '토'
    },
    combined: {
      hangul: '갑진',
      hanja: '甲辰',
      romanization: 'Gapjin'
    },
    element: '목',
    yinYang: '양'
  },
  {
    id: 41,
    tiangan: {
      id: 1,
      hangul: '을',
      hanja: '乙',
      romanization: 'Eul',
      element: '목'
    },
    dizhi: {
      id: 5,
      hangul: '사',
      hanja: '巳',
      romanization: 'Sa',
      animal: '뱀',
      element: '화'
    },
    combined: {
      hangul: '을사',
      hanja: '乙巳',
      romanization: 'Eulsa'
    },
    element: '목',
    yinYang: '음'
  },
  {
    id: 42,
    tiangan: {
      id: 2,
      hangul: '병',
      hanja: '丙',
      romanization: 'Byeong',
      element: '화'
    },
    dizhi: {
      id: 6,
      hangul: '오',
      hanja: '午',
      romanization: 'O',
      animal: '말',
      element: '화'
    },
    combined: {
      hangul: '병오',
      hanja: '丙午',
      romanization: 'Byeongo'
    },
    element: '화',
    yinYang: '양'
  },
  {
    id: 43,
    tiangan: {
      id: 3,
      hangul: '정',
      hanja: '丁',
      romanization: 'Jeong',
      element: '화'
    },
    dizhi: {
      id: 7,
      hangul: '미',
      hanja: '未',
      romanization: 'Mi',
      animal: '양',
      element: '토'
    },
    combined: {
      hangul: '정미',
      hanja: '丁未',
      romanization: 'Jeongmi'
    },
    element: '화',
    yinYang: '음'
  },
  {
    id: 44,
    tiangan: {
      id: 4,
      hangul: '무',
      hanja: '戊',
      romanization: 'Mu',
      element: '토'
    },
    dizhi: {
      id: 8,
      hangul: '신',
      hanja: '申',
      romanization: 'Sin',
      animal: '원숭이',
      element: '금'
    },
    combined: {
      hangul: '무신',
      hanja: '戊申',
      romanization: 'Musin'
    },
    element: '토',
    yinYang: '양'
  },
  {
    id: 45,
    tiangan: {
      id: 5,
      hangul: '기',
      hanja: '己',
      romanization: 'Gi',
      element: '토'
    },
    dizhi: {
      id: 9,
      hangul: '유',
      hanja: '酉',
      romanization: 'Yu',
      animal: '닭',
      element: '금'
    },
    combined: {
      hangul: '기유',
      hanja: '己酉',
      romanization: 'Giyu'
    },
    element: '토',
    yinYang: '음'
  },
  {
    id: 46,
    tiangan: {
      id: 6,
      hangul: '경',
      hanja: '庚',
      romanization: 'Gyeong',
      element: '금'
    },
    dizhi: {
      id: 10,
      hangul: '술',
      hanja: '戌',
      romanization: 'Sul',
      animal: '개',
      element: '토'
    },
    combined: {
      hangul: '경술',
      hanja: '庚戌',
      romanization: 'Gyeongsul'
    },
    element: '금',
    yinYang: '양'
  },
  {
    id: 47,
    tiangan: {
      id: 7,
      hangul: '신',
      hanja: '辛',
      romanization: 'Sin',
      element: '금'
    },
    dizhi: {
      id: 11,
      hangul: '해',
      hanja: '亥',
      romanization: 'Hae',
      animal: '돼지',
      element: '수'
    },
    combined: {
      hangul: '신해',
      hanja: '辛亥',
      romanization: 'Sinhae'
    },
    element: '금',
    yinYang: '음'
  },
  {
    id: 48,
    tiangan: {
      id: 8,
      hangul: '임',
      hanja: '壬',
      romanization: 'Im',
      element: '수'
    },
    dizhi: {
      id: 0,
      hangul: '자',
      hanja: '子',
      romanization: 'Ja',
      animal: '쥐',
      element: '수'
    },
    combined: {
      hangul: '임자',
      hanja: '壬子',
      romanization: 'Imja'
    },
    element: '수',
    yinYang: '양'
  },
  {
    id: 49,
    tiangan: {
      id: 9,
      hangul: '계',
      hanja: '癸',
      romanization: 'Gye',
      element: '수'
    },
    dizhi: {
      id: 1,
      hangul: '축',
      hanja: '丑',
      romanization: 'Chuk',
      animal: '소',
      element: '토'
    },
    combined: {
      hangul: '계축',
      hanja: '癸丑',
      romanization: 'Gyechuk'
    },
    element: '수',
    yinYang: '음'
  },
  {
    id: 50,
    tiangan: {
      id: 0,
      hangul: '갑',
      hanja: '甲',
      romanization: 'Gap',
      element: '목'
    },
    dizhi: {
      id: 2,
      hangul: '인',
      hanja: '寅',
      romanization: 'In',
      animal: '호랑이',
      element: '목'
    },
    combined: {
      hangul: '갑인',
      hanja: '甲寅',
      romanization: 'Gapin'
    },
    element: '목',
    yinYang: '양'
  },
  {
    id: 51,
    tiangan: {
      id: 1,
      hangul: '을',
      hanja: '乙',
      romanization: 'Eul',
      element: '목'
    },
    dizhi: {
      id: 3,
      hangul: '묘',
      hanja: '卯',
      romanization: 'Myo',
      animal: '토끼',
      element: '목'
    },
    combined: {
      hangul: '을묘',
      hanja: '乙卯',
      romanization: 'Eulmyo'
    },
    element: '목',
    yinYang: '음'
  },
  {
    id: 52,
    tiangan: {
      id: 2,
      hangul: '병',
      hanja: '丙',
      romanization: 'Byeong',
      element: '화'
    },
    dizhi: {
      id: 4,
      hangul: '진',
      hanja: '辰',
      romanization: 'Jin',
      animal: '용',
      element: '토'
    },
    combined: {
      hangul: '병진',
      hanja: '丙辰',
      romanization: 'Byeongjin'
    },
    element: '화',
    yinYang: '양'
  },
  {
    id: 53,
    tiangan: {
      id: 3,
      hangul: '정',
      hanja: '丁',
      romanization: 'Jeong',
      element: '화'
    },
    dizhi: {
      id: 5,
      hangul: '사',
      hanja: '巳',
      romanization: 'Sa',
      animal: '뱀',
      element: '화'
    },
    combined: {
      hangul: '정사',
      hanja: '丁巳',
      romanization: 'Jeongsa'
    },
    element: '화',
    yinYang: '음'
  },
  {
    id: 54,
    tiangan: {
      id: 4,
      hangul: '무',
      hanja: '戊',
      romanization: 'Mu',
      element: '토'
    },
    dizhi: {
      id: 6,
      hangul: '오',
      hanja: '午',
      romanization: 'O',
      animal: '말',
      element: '화'
    },
    combined: {
      hangul: '무오',
      hanja: '戊午',
      romanization: 'Muo'
    },
    element: '토',
    yinYang: '양'
  },
  {
    id: 55,
    tiangan: {
      id: 5,
      hangul: '기',
      hanja: '己',
      romanization: 'Gi',
      element: '토'
    },
    dizhi: {
      id: 7,
      hangul: '미',
      hanja: '未',
      romanization: 'Mi',
      animal: '양',
      element: '토'
    },
    combined: {
      hangul: '기미',
      hanja: '己未',
      romanization: 'Gimi'
    },
    element: '토',
    yinYang: '음'
  },
  {
    id: 56,
    tiangan: {
      id: 6,
      hangul: '경',
      hanja: '庚',
      romanization: 'Gyeong',
      element: '금'
    },
    dizhi: {
      id: 8,
      hangul: '신',
      hanja: '申',
      romanization: 'Sin',
      animal: '원숭이',
      element: '금'
    },
    combined: {
      hangul: '경신',
      hanja: '庚申',
      romanization: 'Gyeongsin'
    },
    element: '금',
    yinYang: '양'
  },
  {
    id: 57,
    tiangan: {
      id: 7,
      hangul: '신',
      hanja: '辛',
      romanization: 'Sin',
      element: '금'
    },
    dizhi: {
      id: 9,
      hangul: '유',
      hanja: '酉',
      romanization: 'Yu',
      animal: '닭',
      element: '금'
    },
    combined: {
      hangul: '신유',
      hanja: '辛酉',
      romanization: 'Sinyu'
    },
    element: '금',
    yinYang: '음'
  },
  {
    id: 58,
    tiangan: {
      id: 8,
      hangul: '임',
      hanja: '壬',
      romanization: 'Im',
      element: '수'
    },
    dizhi: {
      id: 10,
      hangul: '술',
      hanja: '戌',
      romanization: 'Sul',
      animal: '개',
      element: '토'
    },
    combined: {
      hangul: '임술',
      hanja: '壬戌',
      romanization: 'Imsul'
    },
    element: '수',
    yinYang: '양'
  },
  {
    id: 59,
    tiangan: {
      id: 9,
      hangul: '계',
      hanja: '癸',
      romanization: 'Gye',
      element: '수'
    },
    dizhi: {
      id: 11,
      hangul: '해',
      hanja: '亥',
      romanization: 'Hae',
      animal: '돼지',
      element: '수'
    },
    combined: {
      hangul: '계해',
      hanja: '癸亥',
      romanization: 'Gyehae'
    },
    element: '수',
    yinYang: '음'
  }
] as const;

/**
 * ID로 60갑자 조회
 * @param id 0~59
 * @returns 60갑자 정보
 */
export function getPillarById(id: number): SixtyPillar {
  if (id < 0 || id >= 60) {
    throw new RangeError(`Pillar ID must be 0~59, got ${id}`);
  }
  return SIXTY_PILLARS[id];
}

/**
 * 한글 갑자로 60갑자 조회
 * @param hangul 갑자 (예: "갑자", "을축")
 * @returns 60갑자 정보 또는 undefined
 */
export function getPillarByHangul(hangul: string): SixtyPillar | undefined {
  return SIXTY_PILLARS.find(p => p.combined.hangul === hangul);
}
