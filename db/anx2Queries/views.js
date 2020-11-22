const b2b = {

     accept: `CREATE VIEW ANX2_3B_SUMM_A AS
     SELECT a.STIN,
            a.TRDNAME,
            a.ACOUNT,
            (IFNULL(c.IDAMT, 0) - IFNULL(d.CAMT, 0) ) AS ATAXAMT,
            a.ITC_PERIOD AS AITC
       FROM (
                SELECT STIN,
                       TRDNAME,
                       ITC_PERIOD,
                       count(1) AS ACOUNT
                  FROM ANX2_3AB
                 WHERE FLG !='X' AND S_RETURN_STAT != 'NF (ITC-NA)' AND 
                       (ACTION_TAKEN = 'A' OR 
                        ( (ACTION_TAKEN IN ('', 'S') OR 
                           ACTION_TAKEN IS NULL) AND 
                          (PORTAL_STAT IN ('A', '') OR 
                           PORTAL_STAT IS NULL) ) OR 
                        (ACTION_TAKEN = 'S' AND 
                         PORTAL_STAT IN ('P', 'R') ) ) 
                 GROUP BY STIN,
                          ITC_PERIOD
            )
            a
            LEFT JOIN
            (
                SELECT STIN,
                       ITC_PERIOD,
                       sum(b.igst + b.sgst + b.cgst + b.cess) AS IDAMT
                  FROM ANX2_3AB b
                 WHERE FLG !='X' AND (b.S_RETURN_STAT != 'NF (ITC-NA)' AND b.IS_ITC_ENTL  NOT IN ( 'N','N/Y')) AND 
                       b.DOCTYPE IN ('I', 'DN') AND 
                       (b.ACTION_TAKEN = 'A' OR 
                        ( (b.ACTION_TAKEN IN ('', 'S') OR 
                           b.ACTION_TAKEN IS NULL) AND 
                          (b.PORTAL_STAT IN ('A', '') OR 
                           b.PORTAL_STAT IS NULL) ) OR 
                        (b.ACTION_TAKEN = 'S' AND 
                         b.PORTAL_STAT IN ('P', 'R') ) ) 
                 GROUP BY b.STIN,
                          b.ITC_PERIOD
            )
            c ON a.STIN = c.STIN AND 
                 a.ITC_PERIOD = c.ITC_PERIOD
            LEFT JOIN
            (
                SELECT STIN,
                       ITC_PERIOD,
                       sum(e.igst + e.sgst + e.cgst + e.cess) AS CAMT
                  FROM ANX2_3AB e
                 WHERE FLG !='X' AND (e.S_RETURN_STAT != 'NF (ITC-NA)' AND e.IS_ITC_ENTL  NOT IN ( 'N','N/Y')) AND 
                       e.DOCTYPE = 'CN' AND 
                       (e.ACTION_TAKEN = 'A' OR 
                        ( (e.ACTION_TAKEN IN ('', 'S') OR 
                           e.ACTION_TAKEN IS NULL) AND 
                          (e.PORTAL_STAT IN ('A', '') OR 
                           e.PORTAL_STAT IS NULL) ) OR 
                        (e.ACTION_TAKEN = 'S' AND 
                         e.PORTAL_STAT IN ('P', 'R') ) ) 
                 GROUP BY e.STIN,
                          e.ITC_PERIOD
            )
            d ON (a.STIN = d.STIN AND 
                  a.ITC_PERIOD = d.ITC_PERIOD) 
      ORDER BY a.STIN;`,
 
      reject: `CREATE VIEW ANX2_3B_SUMM_R AS
  SELECT a.STIN,
         a.TRDNAME,
         a.RCOUNT,
         (IFNULL(c.IDAMT, 0) - IFNULL(d.CAMT, 0) ) AS RTAXAMT,
         a.ITC_PERIOD AS RITC
    FROM (
             SELECT STIN,
                    TRDNAME,
                    ITC_PERIOD,
                    count(1) AS RCOUNT
               FROM ANX2_3AB
              WHERE FLG !='X' AND (ACTION_TAKEN = 'R' OR 
                     ( (ACTION_TAKEN = '' OR 
                        ACTION_TAKEN IS NULL) AND 
                       (PORTAL_STAT = 'R') ) ) 
              GROUP BY STIN,
                       ITC_PERIOD
         )
         a
         LEFT JOIN
         (
             SELECT STIN,
                    ITC_PERIOD,
                    sum(b.igst + b.sgst + b.cgst + b.cess) AS IDAMT
               FROM ANX2_3AB b
              WHERE FLG !='X' AND b.IS_ITC_ENTL  NOT IN ( 'N','N/Y') AND 
                    b.DOCTYPE IN ('I', 'DN') AND 
                    (b.ACTION_TAKEN = 'R' OR 
                     ( (b.ACTION_TAKEN = '' OR 
                        b.ACTION_TAKEN IS NULL) AND 
                       (b.PORTAL_STAT = 'R') ) ) 
              GROUP BY b.STIN,
                       b.ITC_PERIOD
         )
         c ON a.STIN = c.STIN AND 
              a.ITC_PERIOD = c.ITC_PERIOD
         LEFT JOIN   
         ( 
             SELECT e.STIN,    
                    e.ITC_PERIOD,   
                    sum(e.igst + e.sgst  + e.cgst + e.cess) AS CAMT
               FROM ANX2_3AB e 
              WHERE FLG !='X' AND e.IS_ITC_ENTL  NOT IN ( 'N','N/Y') AND 
                    e.DOCTYPE = 'CN' AND  
                    (e.ACTION_TAKEN = 'R' OR 
                     ( (e.ACTION_TAKEN = '' OR 
                        e.ACTION_TAKEN IS NULL) AND 
                       (e.PORTAL_STAT = 'R') ) ) 
              GROUP BY e.STIN,
                       e.ITC_PERIOD
         )
         d ON a.STIN = d.STIN AND 
              a.ITC_PERIOD = d.ITC_PERIOD
   ORDER BY a.STIN;`,
 
      pending: `CREATE VIEW ANX2_3B_SUMM_P AS
  SELECT a.STIN,
         a.TRDNAME,
         a.PCOUNT,
         (IFNULL(c.IDAMT, 0) - IFNULL(d.CAMT, 0) ) AS PTAXAMT,
         a.ITC_PERIOD AS PITC
    FROM (
             SELECT STIN,
                    TRDNAME,
                    ITC_PERIOD,
                    count(1) AS PCOUNT
               FROM ANX2_3AB
              WHERE FLG !='X' AND (ACTION_TAKEN = 'P' OR 
                     ( (ACTION_TAKEN = '' OR 
                        ACTION_TAKEN IS NULL) AND 
                       (PORTAL_STAT = 'P') ) OR 
                     (S_RETURN_STAT = 'NF (ITC-NA)' AND 
                      ( (ACTION_TAKEN IN ('', 'S') OR 
                         ACTION_TAKEN IS NULL) AND 
                        (PORTAL_STAT IN ('A', '') OR 
                         PORTAL_STAT IS NULL) ) ) ) 
              GROUP BY STIN,
                       ITC_PERIOD
         )
         a
         LEFT JOIN
         (
             SELECT b.STIN,
                    b.ITC_PERIOD,
                    sum(b.igst + b.sgst + b.cgst + b.cess) AS IDAMT
               FROM ANX2_3AB b
              WHERE FLG !='X' AND b.IS_ITC_ENTL  NOT IN ( 'N','N/Y') AND 
                    b.DOCTYPE IN ('I', 'DN') AND 
                    (b.ACTION_TAKEN = 'P' OR 
                     ( (b.ACTION_TAKEN = '' OR 
                        b.ACTION_TAKEN IS NULL) AND 
                       (b.PORTAL_STAT = 'P') ) OR 
                     (b.S_RETURN_STAT = 'NF (ITC-NA)' AND 
                      ( (b.ACTION_TAKEN IN ('', 'S') OR 
                         b.ACTION_TAKEN IS NULL) AND 
                        (b.PORTAL_STAT IN ('A', '') OR 
                         b.PORTAL_STAT IS NULL) ) ) ) 
              GROUP BY b.STIN,
                       b.ITC_PERIOD
         )
         c ON a.STIN = c.STIN AND 
              a.ITC_PERIOD = c.ITC_PERIOD
         LEFT JOIN
         (
             SELECT e.STIN,
                    e.ITC_PERIOD,
                    sum(e.igst + e.sgst + e.cgst + e.cess) AS CAMT
               FROM ANX2_3AB e
              WHERE FLG !='X' AND e.IS_ITC_ENTL  NOT IN ( 'N','N/Y') AND 
                    e.DOCTYPE = 'CN' AND 
                    (e.ACTION_TAKEN = 'P' OR 
                     ( (e.ACTION_TAKEN = '' OR 
                        e.ACTION_TAKEN IS NULL) AND 
                       (e.PORTAL_STAT = 'P') ) OR 
                     (e.S_RETURN_STAT = 'NF (ITC-NA)' AND 
                      ( (e.ACTION_TAKEN IN ('', 'S') OR 
                         e.ACTION_TAKEN IS NULL) AND 
                        (e.PORTAL_STAT IN ('A', '') OR 
                         e.PORTAL_STAT IS NULL) ) ) ) 
              GROUP BY e.STIN,
                       e.ITC_PERIOD
         )
         d ON a.STIN = d.STIN AND 
              a.ITC_PERIOD = d.ITC_PERIOD
   ORDER BY a.STIN;`,
 
     summaccept:
          `CREATE VIEW ANX2_3B_DSUMM_A AS
    SELECT a.COUNT AS count,
           (IFNULL(c.IDVAL, 0) - IFNULL(d.CVAL, 0) ) AS taxval,
           (IFNULL(f.IIGST, 0) - IFNULL(g.CIGST, 0) ) AS igst,
           (IFNULL(f.ICGST, 0) - IFNULL(g.CCGST, 0) ) AS cgst,
           (IFNULL(f.ISGST, 0) - IFNULL(g.CSGST, 0) ) AS sgst,
           (IFNULL(f.ICESS, 0) - IFNULL(g.CCESS, 0) ) AS cess,
           a.ITC_PERIOD
      FROM (
               SELECT ITC_PERIOD,
                      count(1) AS COUNT
                 FROM ANX2_3AB
                WHERE FLG != 'X' AND 
                      S_RETURN_STAT != 'NF (ITC-NA)' AND 
                      (ACTION_TAKEN = 'A' OR 
                       ( (ACTION_TAKEN IN ('', 'S') OR 
                          ACTION_TAKEN IS NULL) AND 
                         (PORTAL_STAT IN ('A', '') OR 
                          PORTAL_STAT IS NULL) ) OR 
                       (ACTION_TAKEN = 'S' AND 
                        PORTAL_STAT IN ('P', 'R') ) ) 
                GROUP BY ITC_PERIOD
           )
           a
           LEFT JOIN
           (
               SELECT ITC_PERIOD,
                      SUM(TAX_VALUE) AS IDVAL
                 FROM ANX2_3AB b
                WHERE FLG != 'X' AND 
                      b.S_RETURN_STAT != 'NF (ITC-NA)' AND 
                      b.DOCTYPE IN ('I', 'DN') AND 
                      (b.ACTION_TAKEN = 'A' OR 
                       ( (b.ACTION_TAKEN IN ('', 'S') OR 
                          b.ACTION_TAKEN IS NULL) AND 
                         (b.PORTAL_STAT IN ('A', '') OR 
                          b.PORTAL_STAT IS NULL) ) OR 
                       (b.ACTION_TAKEN = 'S' AND 
                        b.PORTAL_STAT IN ('P', 'R') ) ) 
                GROUP BY b.ITC_PERIOD
           )
           c ON a.ITC_PERIOD = c.ITC_PERIOD
           LEFT JOIN
           (
               SELECT ITC_PERIOD,
                      SUM(TAX_VALUE) AS CVAL
                 FROM ANX2_3AB e
                WHERE FLG != 'X' AND 
                      e.S_RETURN_STAT != 'NF (ITC-NA)' AND 
                      e.DOCTYPE = 'CN' AND 
                      (e.ACTION_TAKEN = 'A' OR 
                       ( (e.ACTION_TAKEN IN ('', 'S') OR 
                          e.ACTION_TAKEN IS NULL) AND 
                         (e.PORTAL_STAT IN ('A', '') OR 
                          e.PORTAL_STAT IS NULL) ) OR 
                       (e.ACTION_TAKEN = 'S' AND 
                        e.PORTAL_STAT IN ('P', 'R') ) ) 
                GROUP BY e.ITC_PERIOD
           )
           d ON (a.ITC_PERIOD = d.ITC_PERIOD) 
           LEFT JOIN
           (
               SELECT ITC_PERIOD,
                      SUM(IGST) AS IIGST,
                      SUM(CGST) AS ICGST,
                      SUM(SGST) AS ISGST,
                      SUM(CESS) AS ICESS
                 FROM ANX2_3AB
                WHERE FLG != 'X' AND 
                      (S_RETURN_STAT != 'NF (ITC-NA)' AND 
                       IS_ITC_ENTL NOT IN ('N', 'N/Y') ) AND 
                      DOCTYPE IN ('I', 'DN') AND 
                      (ACTION_TAKEN = 'A' OR 
                       ( (ACTION_TAKEN IN ('', 'S') OR 
                          ACTION_TAKEN IS NULL) AND 
                         (PORTAL_STAT IN ('A', '') OR 
                          PORTAL_STAT IS NULL) ) OR 
                       (ACTION_TAKEN = 'S' AND 
                        PORTAL_STAT IN ('P', 'R') ) ) 
                GROUP BY ITC_PERIOD
           )
           f ON a.ITC_PERIOD = f.ITC_PERIOD
           LEFT JOIN
           (
               SELECT ITC_PERIOD,
                      SUM(IGST) AS CIGST,
                      SUM(CGST) AS CCGST,
                      SUM(SGST) AS CSGST,
                      SUM(CESS) AS CCESS
                 FROM ANX2_3AB
                WHERE FLG != 'X' AND 
                      (S_RETURN_STAT != 'NF (ITC-NA)' AND 
                       IS_ITC_ENTL NOT IN ('N', 'N/Y') ) AND 
                      DOCTYPE = 'CN' AND 
                      (ACTION_TAKEN = 'A' OR 
                       ( (ACTION_TAKEN IN ('', 'S') OR 
                          ACTION_TAKEN IS NULL) AND 
                         (PORTAL_STAT IN ('A', '') OR 
                          PORTAL_STAT IS NULL) ) OR 
                       (ACTION_TAKEN = 'S' AND 
                        PORTAL_STAT IN ('P', 'R') ) ) 
                GROUP BY ITC_PERIOD
           )
           g ON a.ITC_PERIOD = g.ITC_PERIOD;`,

           summreject:
               `CREATE VIEW ANX2_3B_DSUMM_R AS
                SELECT a.COUNT as count,
                       (IFNULL(c.IDVAL, 0) - IFNULL(d.CVAL, 0) ) AS taxval,
                       (IFNULL(f.IIGST, 0) - IFNULL(g.CIGST, 0) ) AS igst,
                       (IFNULL(f.ICGST, 0) - IFNULL(g.CCGST, 0) ) AS cgst,
                       (IFNULL(f.ISGST, 0) - IFNULL(g.CSGST, 0) ) AS sgst,
                       (IFNULL(f.ICESS, 0) - IFNULL(g.CCESS, 0) ) AS cess,
                       a.ITC_PERIOD
                  FROM (
                           SELECT ITC_PERIOD,
                                  count(1) AS COUNT
                             FROM ANX2_3AB
                            WHERE FLG !='X' AND  (ACTION_TAKEN = 'R' OR 
                                   ( (ACTION_TAKEN = '' OR 
                                      ACTION_TAKEN IS NULL) AND 
                                     (PORTAL_STAT = 'R') ) ) 
                            GROUP BY ITC_PERIOD
                       )
                       a
                       LEFT JOIN
                       (
                           SELECT ITC_PERIOD,
                                  SUM(TAX_VALUE) AS IDVAL
                             FROM ANX2_3AB b
                            WHERE FLG !='X' AND  b.DOCTYPE IN ('I', 'DN') AND 
                                  (b.ACTION_TAKEN = 'R' OR 
                                   ( (b.ACTION_TAKEN = '' OR 
                                      b.ACTION_TAKEN IS NULL) AND 
                                     (b.PORTAL_STAT = 'R') ) ) 
                            GROUP BY b.ITC_PERIOD
                       )
                       c ON a.ITC_PERIOD = c.ITC_PERIOD
                       LEFT JOIN
                       (
                           SELECT ITC_PERIOD,
                                  SUM(TAX_VALUE) AS CVAL
                             FROM ANX2_3AB e
                            WHERE FLG !='X' AND  e.DOCTYPE = 'CN' AND 
                                  (e.ACTION_TAKEN = 'R' OR 
                                   ( (e.ACTION_TAKEN = '' OR 
                                      e.ACTION_TAKEN IS NULL) AND 
                                     (e.PORTAL_STAT = 'R') ) ) 
                            GROUP BY e.ITC_PERIOD
                       )
                       d ON (a.ITC_PERIOD = d.ITC_PERIOD) 
                       LEFT JOIN
                       (
                           SELECT ITC_PERIOD,
                                  SUM(IGST) AS IIGST,
                                  SUM(CGST) AS ICGST,
                                  SUM(SGST) AS ISGST,
                                  SUM(CESS) AS ICESS
                             FROM ANX2_3AB
                            WHERE FLG !='X' AND  IS_ITC_ENTL NOT IN ('N', 'N/Y') AND 
                                  DOCTYPE IN ('I', 'DN') AND 
                                  (ACTION_TAKEN = 'R' OR 
                                   ( (ACTION_TAKEN = '' OR 
                                      ACTION_TAKEN IS NULL) AND 
                                     (PORTAL_STAT = 'R') ) ) 
                            GROUP BY ITC_PERIOD
                       )
                       f ON a.ITC_PERIOD = f.ITC_PERIOD
                       LEFT JOIN
                       (
                           SELECT ITC_PERIOD,
                                  SUM(IGST) AS CIGST,
                                  SUM(CGST) AS CCGST,
                                  SUM(SGST) AS CSGST,
                                  SUM(CESS) AS CCESS
                             FROM ANX2_3AB
                            WHERE FLG !='X' AND  IS_ITC_ENTL NOT IN ('N', 'N/Y') AND 
                                  DOCTYPE = 'CN' AND 
                                  (ACTION_TAKEN = 'R' OR 
                                   ( (ACTION_TAKEN = '' OR 
                                      ACTION_TAKEN IS NULL) AND 
                                     (PORTAL_STAT = 'R') ) ) 
                            GROUP BY ITC_PERIOD
                       )
                       g ON a.ITC_PERIOD = g.ITC_PERIOD;`,

          summpending:
               `CREATE VIEW ANX2_3B_DSUMM_P AS
         SELECT a.COUNT as count,
                (IFNULL(c.IDVAL, 0) - IFNULL(d.CVAL, 0) ) AS taxval,
                (IFNULL(f.IIGST, 0) - IFNULL(g.CIGST, 0) ) AS igst,
                (IFNULL(f.ICGST, 0) - IFNULL(g.CCGST, 0) ) AS cgst,
                (IFNULL(f.ISGST, 0) - IFNULL(g.CSGST, 0) ) AS sgst,
                (IFNULL(f.ICESS, 0) - IFNULL(g.CCESS, 0) ) AS cess,
                a.ITC_PERIOD
           FROM (
                    SELECT ITC_PERIOD,
                           count(1) AS COUNT
                      FROM ANX2_3AB
                     WHERE FLG !='X' AND  (ACTION_TAKEN = 'P' OR 
                            ( (ACTION_TAKEN = '' OR 
                               ACTION_TAKEN IS NULL) AND 
                              (PORTAL_STAT = 'P') ) OR 
                            (S_RETURN_STAT = 'NF (ITC-NA)' AND 
                             ( (ACTION_TAKEN IN ('', 'S') OR 
                                ACTION_TAKEN IS NULL) AND 
                               (PORTAL_STAT IN ('A', '') OR 
                                PORTAL_STAT IS NULL) ) ) ) 
                     GROUP BY ITC_PERIOD
                )
                a
                LEFT JOIN
                (
                    SELECT ITC_PERIOD,
                           SUM(TAX_VALUE) AS IDVAL
                      FROM ANX2_3AB b
                     WHERE FLG !='X' AND  b.DOCTYPE IN ('I', 'DN') AND 
                           (b.ACTION_TAKEN = 'P' OR 
                            ( (b.ACTION_TAKEN = '' OR 
                               b.ACTION_TAKEN IS NULL) AND 
                              (b.PORTAL_STAT = 'P') ) OR 
                            (b.S_RETURN_STAT = 'NF (ITC-NA)' AND 
                             ( (b.ACTION_TAKEN IN ('', 'S') OR 
                                b.ACTION_TAKEN IS NULL) AND 
                               (b.PORTAL_STAT IN ('A', '') OR 
                                b.PORTAL_STAT IS NULL) ) ) ) 
                     GROUP BY b.ITC_PERIOD
                )
                c ON a.ITC_PERIOD = c.ITC_PERIOD
                LEFT JOIN
                (
                    SELECT ITC_PERIOD,
                           SUM(TAX_VALUE) AS CVAL
                      FROM ANX2_3AB e
                     WHERE FLG !='X' AND  e.DOCTYPE = 'CN' AND 
                           (e.ACTION_TAKEN = 'P' OR 
                            ( (e.ACTION_TAKEN = '' OR 
                               e.ACTION_TAKEN IS NULL) AND 
                              (e.PORTAL_STAT = 'P') ) OR 
                            (e.S_RETURN_STAT = 'NF (ITC-NA)' AND 
                             ( (e.ACTION_TAKEN IN ('', 'S') OR 
                                e.ACTION_TAKEN IS NULL) AND 
                               (e.PORTAL_STAT IN ('A', '') OR 
                                e.PORTAL_STAT IS NULL) ) ) ) 
                     GROUP BY e.ITC_PERIOD
                )
                d ON (a.ITC_PERIOD = d.ITC_PERIOD) 
                LEFT JOIN
                (
                    SELECT ITC_PERIOD,
                           SUM(IGST) AS IIGST,
                           SUM(CGST) AS ICGST,
                           SUM(SGST) AS ISGST,
                           SUM(CESS) AS ICESS
                      FROM ANX2_3AB
                     WHERE FLG !='X' AND  IS_ITC_ENTL NOT IN ('N', 'N/Y') AND 
                           DOCTYPE IN ('I', 'DN') AND 
                           (ACTION_TAKEN = 'P' OR 
                            ( (ACTION_TAKEN = '' OR 
                               ACTION_TAKEN IS NULL) AND 
                              (PORTAL_STAT = 'P') ) OR 
                            (S_RETURN_STAT = 'NF (ITC-NA)' AND 
                             ( (ACTION_TAKEN IN ('', 'S') OR 
                                ACTION_TAKEN IS NULL) AND 
                               (PORTAL_STAT IN ('A', '') OR 
                                PORTAL_STAT IS NULL) ) ) ) 
                     GROUP BY ITC_PERIOD
                )
                f ON a.ITC_PERIOD = f.ITC_PERIOD
                LEFT JOIN
                (
                    SELECT ITC_PERIOD,
                           SUM(IGST) AS CIGST,
                           SUM(CGST) AS CCGST,
                           SUM(SGST) AS CSGST,
                           SUM(CESS) AS CCESS
                      FROM ANX2_3AB
                     WHERE FLG !='X' AND  IS_ITC_ENTL NOT IN ('N', 'N/Y') AND 
                           DOCTYPE = 'CN' AND 
                           (ACTION_TAKEN = 'P' OR 
                            ( (ACTION_TAKEN = '' OR 
                               ACTION_TAKEN IS NULL) AND 
                              (PORTAL_STAT = 'P') ) OR 
                            (S_RETURN_STAT = 'NF (ITC-NA)' AND 
                             ( (ACTION_TAKEN IN ('', 'S') OR 
                                ACTION_TAKEN IS NULL) AND 
                               (PORTAL_STAT IN ('A', '') OR 
                                PORTAL_STAT IS NULL) ) ) ) 
                     GROUP BY ITC_PERIOD
                )
                g ON a.ITC_PERIOD = g.ITC_PERIOD;`,
                
   erraccept: `CREATE VIEW ANX2_3B_ERR_SUMM_A AS
    SELECT a.STIN,
           a.TRDNAME,
           a.ACOUNT,
           (IFNULL(c.IDAMT, 0) - IFNULL(d.CAMT, 0) ) AS ATAXAMT,
           (IFNULL(e.AECOUNT, 0)) AS AECOUNT,
           a.ITC_PERIOD AS AITC
      FROM (
               SELECT STIN,
                      TRDNAME,
                      ITC_PERIOD,
                      count(1) AS ACOUNT
                 FROM ANX2_3AB
                WHERE (FLG = 'X' OR 
                       ERROR_CODE IS NOT NULL) AND 
                      S_RETURN_STAT != 'NF (ITC-NA)' AND 
                      (ACTION_TAKEN = 'A' OR 
                       ( (ACTION_TAKEN IN ('', 'S') OR 
                          ACTION_TAKEN IS NULL) AND 
                         (PORTAL_STAT IN ('A', '') OR 
                          PORTAL_STAT IS NULL) ) OR 
                       (ACTION_TAKEN = 'S' AND 
                        PORTAL_STAT IN ('P', 'R') ) ) 
                GROUP BY STIN,
                         ITC_PERIOD
           )
           a
           LEFT JOIN
           (
               SELECT STIN,
                      ITC_PERIOD,
                      sum(b.igst + b.sgst + b.cgst + b.cess) AS IDAMT
                 FROM ANX2_3AB b
                WHERE (FLG = 'X' OR 
                       ERROR_CODE IS NOT NULL) AND 
                      (b.S_RETURN_STAT != 'NF (ITC-NA)' AND 
                       b.IS_ITC_ENTL NOT IN ('N', 'N/Y') ) AND 
                      b.DOCTYPE IN ('I', 'DN') AND 
                      (b.ACTION_TAKEN = 'A' OR 
                       ( (b.ACTION_TAKEN IN ('', 'S') OR 
                          b.ACTION_TAKEN IS NULL) AND 
                         (b.PORTAL_STAT IN ('A', '') OR 
                          b.PORTAL_STAT IS NULL) ) OR 
                       (b.ACTION_TAKEN = 'S' AND 
                        b.PORTAL_STAT IN ('P', 'R') ) ) 
                GROUP BY b.STIN,
                         b.ITC_PERIOD
           )
           c ON a.STIN = c.STIN AND 
                a.ITC_PERIOD = c.ITC_PERIOD
           LEFT JOIN
           (
               SELECT STIN,
                      ITC_PERIOD,
                      sum(e.igst + e.sgst + e.cgst + e.cess) AS CAMT
                 FROM ANX2_3AB e
                WHERE (FLG = 'X' OR 
                       ERROR_CODE IS NOT NULL) AND 
                      (e.S_RETURN_STAT != 'NF (ITC-NA)' AND 
                       e.IS_ITC_ENTL NOT IN ('N', 'N/Y') ) AND 
                      e.DOCTYPE = 'CN' AND 
                      (e.ACTION_TAKEN = 'A' OR 
                       ( (e.ACTION_TAKEN IN ('', 'S') OR 
                          e.ACTION_TAKEN IS NULL) AND 
                         (e.PORTAL_STAT IN ('A', '') OR 
                          e.PORTAL_STAT IS NULL) ) OR 
                       (e.ACTION_TAKEN = 'S' AND 
                        e.PORTAL_STAT IN ('P', 'R') ) ) 
                GROUP BY e.STIN,
                         e.ITC_PERIOD
           )
           d ON (a.STIN = d.STIN AND 
                 a.ITC_PERIOD = d.ITC_PERIOD) 
           LEFT JOIN
           (
               SELECT STIN,
                      TRDNAME,
                      ITC_PERIOD,
                      count(1) AS AECOUNT
                 FROM ANX2_3AB
                WHERE FLG = 'X' AND 
                      S_RETURN_STAT != 'NF (ITC-NA)' AND 
                      (ACTION_TAKEN = 'A' OR 
                       ( (ACTION_TAKEN IN ('', 'S') OR 
                          ACTION_TAKEN IS NULL) AND 
                         (PORTAL_STAT IN ('A', '') OR 
                          PORTAL_STAT IS NULL) ) OR 
                       (ACTION_TAKEN = 'S' AND 
                        PORTAL_STAT IN ('P', 'R') ) ) 
                GROUP BY STIN,
                         ITC_PERIOD
           )
           e ON (a.STIN = e.STIN AND 
                 a.ITC_PERIOD = e.ITC_PERIOD) 
     ORDER BY a.STIN;`,
     
     errpending: `CREATE VIEW ANX2_3B_ERR_SUMM_P AS
    SELECT a.STIN,
           a.TRDNAME,
           a.PCOUNT,
           (IFNULL(c.IDAMT, 0) - IFNULL(d.CAMT, 0) ) AS PTAXAMT,
           (IFNULL (e.PECOUNT,0)) AS PECOUNT,
           a.ITC_PERIOD AS PITC
      FROM (
               SELECT STIN,
                      TRDNAME,
                      ITC_PERIOD,
                      count(1) AS PCOUNT
                 FROM ANX2_3AB
                WHERE (FLG = 'X' OR 
                       ERROR_CODE IS NOT NULL) AND 
                      (ACTION_TAKEN = 'P' OR 
                       ( (ACTION_TAKEN = '' OR 
                          ACTION_TAKEN IS NULL) AND 
                         (PORTAL_STAT = 'P') ) OR 
                       (S_RETURN_STAT = 'NF (ITC-NA)' AND 
                        ( (ACTION_TAKEN IN ('', 'S') OR 
                           ACTION_TAKEN IS NULL) AND 
                          (PORTAL_STAT IN ('A', '') OR 
                           PORTAL_STAT IS NULL) ) ) ) 
                GROUP BY STIN,
                         ITC_PERIOD
           )
           a
           LEFT JOIN
           (
               SELECT b.STIN,
                      b.ITC_PERIOD,
                      sum(b.igst + b.sgst + b.cgst + b.cess) AS IDAMT
                 FROM ANX2_3AB b
                WHERE (FLG = 'X' OR 
                       ERROR_CODE IS NOT NULL) AND 
                      b.IS_ITC_ENTL NOT IN ('N', 'N/Y') AND 
                      b.DOCTYPE IN ('I', 'DN') AND 
                      (b.ACTION_TAKEN = 'P' OR 
                       ( (b.ACTION_TAKEN = '' OR 
                          b.ACTION_TAKEN IS NULL) AND 
                         (b.PORTAL_STAT = 'P') ) OR 
                       (b.S_RETURN_STAT = 'NF (ITC-NA)' AND 
                        ( (b.ACTION_TAKEN IN ('', 'S') OR 
                           b.ACTION_TAKEN IS NULL) AND 
                          (b.PORTAL_STAT IN ('A', '') OR 
                           b.PORTAL_STAT IS NULL) ) ) ) 
                GROUP BY b.STIN,
                         b.ITC_PERIOD
           )
           c ON a.STIN = c.STIN AND 
                a.ITC_PERIOD = c.ITC_PERIOD
           LEFT JOIN
           (
               SELECT e.STIN,
                      e.ITC_PERIOD,
                      sum(e.igst + e.sgst + e.cgst + e.cess) AS CAMT
                 FROM ANX2_3AB e
                WHERE (FLG = 'X' OR 
                       ERROR_CODE IS NOT NULL) AND 
                      e.IS_ITC_ENTL NOT IN ('N', 'N/Y') AND 
                      e.DOCTYPE = 'CN' AND 
                      (e.ACTION_TAKEN = 'P' OR 
                       ( (e.ACTION_TAKEN = '' OR 
                          e.ACTION_TAKEN IS NULL) AND 
                         (e.PORTAL_STAT = 'P') ) OR 
                       (e.S_RETURN_STAT = 'NF (ITC-NA)' AND 
                        ( (e.ACTION_TAKEN IN ('', 'S') OR 
                           e.ACTION_TAKEN IS NULL) AND 
                          (e.PORTAL_STAT IN ('A', '') OR 
                           e.PORTAL_STAT IS NULL) ) ) ) 
                GROUP BY e.STIN,
                         e.ITC_PERIOD
           )
           d ON a.STIN = d.STIN AND 
                a.ITC_PERIOD = d.ITC_PERIOD
           LEFT JOIN
           (
               SELECT STIN,
                      TRDNAME,
                      ITC_PERIOD,
                      count(1) AS PECOUNT
                 FROM ANX2_3AB
                WHERE FLG = 'X' AND 
                      (ACTION_TAKEN = 'P' OR 
                       ( (ACTION_TAKEN = '' OR 
                          ACTION_TAKEN IS NULL) AND 
                         (PORTAL_STAT = 'P') ) OR 
                       (S_RETURN_STAT = 'NF (ITC-NA)' AND 
                        ( (ACTION_TAKEN IN ('', 'S') OR 
                           ACTION_TAKEN IS NULL) AND 
                          (PORTAL_STAT IN ('A', '') OR 
                           PORTAL_STAT IS NULL) ) ) ) 
                GROUP BY STIN,
                         ITC_PERIOD
           )
           e ON a.STIN = e.STIN AND 
                a.ITC_PERIOD = e.ITC_PERIOD
     ORDER BY a.STIN;`,

     errreject:`CREATE VIEW ANX2_3B_ERR_SUMM_R AS
     SELECT a.STIN,
            a.TRDNAME,
            a.RCOUNT,
            (IFNULL(c.IDAMT, 0) - IFNULL(d.CAMT, 0) ) AS RTAXAMT,
            (IFNULL(e.RECOUNT,0)) AS RECOUNT,
            a.ITC_PERIOD AS RITC
       FROM (
                SELECT STIN,
                       TRDNAME,
                       ITC_PERIOD,
                       count(1) AS RCOUNT
                  FROM ANX2_3AB
                 WHERE (FLG = 'X' OR 
                        ERROR_CODE IS NOT NULL) AND 
                       (ACTION_TAKEN = 'R' OR 
                        ( (ACTION_TAKEN = '' OR 
                           ACTION_TAKEN IS NULL) AND 
                          (PORTAL_STAT = 'R') ) ) 
                 GROUP BY STIN,
                          ITC_PERIOD
            )
            a
            LEFT JOIN
            (
                SELECT STIN,
                       ITC_PERIOD,
                       sum(b.igst + b.sgst + b.cgst + b.cess) AS IDAMT
                  FROM ANX2_3AB b
                 WHERE (FLG = 'X' OR 
                        ERROR_CODE IS NOT NULL) AND 
                       b.IS_ITC_ENTL NOT IN ('N', 'N/Y') AND 
                       b.DOCTYPE IN ('I', 'DN') AND 
                       (b.ACTION_TAKEN = 'R' OR 
                        ( (b.ACTION_TAKEN = '' OR 
                           b.ACTION_TAKEN IS NULL) AND 
                          (b.PORTAL_STAT = 'R') ) ) 
                 GROUP BY b.STIN,
                          b.ITC_PERIOD
            )
            c ON a.STIN = c.STIN AND 
                 a.ITC_PERIOD = c.ITC_PERIOD
            LEFT JOIN
            (
                SELECT e.STIN,
                       e.ITC_PERIOD,
                       sum(e.igst + e.sgst + e.cgst + e.cess) AS CAMT
                  FROM ANX2_3AB e
                 WHERE (FLG = 'X' OR 
                        ERROR_CODE IS NOT NULL) AND 
                       e.IS_ITC_ENTL NOT IN ('N', 'N/Y') AND 
                       e.DOCTYPE = 'CN' AND 
                       (e.ACTION_TAKEN = 'R' OR 
                        ( (e.ACTION_TAKEN = '' OR 
                           e.ACTION_TAKEN IS NULL) AND 
                          (e.PORTAL_STAT = 'R') ) ) 
                 GROUP BY e.STIN,
                          e.ITC_PERIOD
            )
            d ON a.STIN = d.STIN AND 
                 a.ITC_PERIOD = d.ITC_PERIOD
            LEFT JOIN
            (
                SELECT STIN,
                       TRDNAME,
                       ITC_PERIOD,
                       count(1) AS RECOUNT
                  FROM ANX2_3AB
                 WHERE FLG = 'X' AND 
                       (ACTION_TAKEN = 'R' OR 
                        ( (ACTION_TAKEN = '' OR 
                           ACTION_TAKEN IS NULL) AND 
                          (PORTAL_STAT = 'R') ) ) 
                 GROUP BY STIN,
                          ITC_PERIOD
            )
            e ON a.STIN = e.STIN AND 
            a.ITC_PERIOD = e.ITC_PERIOD
      ORDER BY a.STIN;`

}

const de = {

    accept: `CREATE VIEW ANX2_3G_SUMM_A AS
    SELECT a.STIN,
           a.TRDNAME,
           a.ACOUNT,
           (IFNULL(c.IDAMT, 0) - IFNULL(d.CAMT, 0) ) AS ATAXAMT,
           a.ITC_PERIOD AS AITC
      FROM (
               SELECT STIN,
                      TRDNAME,
                      ITC_PERIOD,
                      count(1) AS ACOUNT
                 FROM ANX2_3AG
                WHERE FLG !='X' AND S_RETURN_STAT != 'NF (ITC-NA)' AND 
                      (ACTION_TAKEN = 'A' OR 
                       ( (ACTION_TAKEN IN ('', 'S') OR 
                          ACTION_TAKEN IS NULL) AND 
                         (PORTAL_STAT IN ('A', '') OR 
                          PORTAL_STAT IS NULL) ) OR 
                       (ACTION_TAKEN = 'S' AND 
                        PORTAL_STAT IN ('P', 'R') ) ) 
                GROUP BY STIN,
                         ITC_PERIOD
           )
           a
           LEFT JOIN
           (
               SELECT STIN,
                      ITC_PERIOD,
                      sum(b.igst + b.sgst + b.cgst + b.cess) AS IDAMT
                 FROM ANX2_3AG b
                WHERE FLG !='X' AND (b.S_RETURN_STAT != 'NF (ITC-NA)' AND 
                       b.IS_ITC_ENTL NOT IN ('N', 'N/Y') AND 
                       CLM_REF != 'Y') AND 
                      b.DOCTYPE IN ('I', 'DN') AND 
                      (b.ACTION_TAKEN = 'A' OR 
                       ( (b.ACTION_TAKEN IN ('', 'S') OR 
                          b.ACTION_TAKEN IS NULL) AND 
                         (b.PORTAL_STAT IN ('A', '') OR 
                          b.PORTAL_STAT IS NULL) ) OR 
                       (b.ACTION_TAKEN = 'S' AND 
                        b.PORTAL_STAT IN ('P', 'R') ) ) 
                GROUP BY b.STIN,
                         b.ITC_PERIOD
           )
           c ON a.STIN = c.STIN AND 
                a.ITC_PERIOD = c.ITC_PERIOD
           LEFT JOIN
           (
               SELECT STIN,
                      ITC_PERIOD,
                      sum(e.igst + e.sgst + e.cgst + e.cess) AS CAMT
                 FROM ANX2_3AG e
                WHERE FLG !='X' AND (e.S_RETURN_STAT != 'NF (ITC-NA)' AND 
                       e.IS_ITC_ENTL NOT IN ('N', 'N/Y') AND 
                       CLM_REF != 'Y') AND 
                      e.DOCTYPE = 'CN' AND 
                      (e.ACTION_TAKEN = 'A' OR 
                       ( (e.ACTION_TAKEN IN ('', 'S') OR 
                          e.ACTION_TAKEN IS NULL) AND 
                         (e.PORTAL_STAT IN ('A', '') OR 
                          e.PORTAL_STAT IS NULL) ) OR 
                       (e.ACTION_TAKEN = 'S' AND 
                        e.PORTAL_STAT IN ('P', 'R') ) ) 
                GROUP BY e.STIN,
                         e.ITC_PERIOD
           )
           d ON (a.STIN = d.STIN AND 
                 a.ITC_PERIOD = d.ITC_PERIOD) 
     ORDER BY a.STIN;`,

     reject: `CREATE VIEW ANX2_3G_SUMM_R AS
    SELECT a.STIN,
           a.TRDNAME,
           a.RCOUNT,
           (IFNULL(c.IDAMT, 0) - IFNULL(d.CAMT, 0) ) AS RTAXAMT,
           a.ITC_PERIOD AS RITC
      FROM (
               SELECT STIN,
                      TRDNAME,
                      ITC_PERIOD,
                      count(1) AS RCOUNT
                 FROM ANX2_3AG
                WHERE FLG !='X' AND (ACTION_TAKEN = 'R' OR 
                       ( (ACTION_TAKEN = '' OR 
                          ACTION_TAKEN IS NULL) AND 
                         (PORTAL_STAT = 'R') ) ) 
                GROUP BY STIN,
                         ITC_PERIOD
           )
           a
           LEFT JOIN
           (
               SELECT STIN,
                      ITC_PERIOD,
                      sum(b.igst + b.sgst + b.cgst + b.cess) AS IDAMT
                 FROM ANX2_3AG b
                WHERE FLG !='X' AND (b.IS_ITC_ENTL NOT IN ('N', 'N/Y') AND 
                       CLM_REF != 'Y') AND 
                      b.DOCTYPE IN ('I', 'DN') AND 
                      (b.ACTION_TAKEN = 'R' OR 
                       ( (b.ACTION_TAKEN = '' OR 
                          b.ACTION_TAKEN IS NULL) AND 
                         (b.PORTAL_STAT = 'R') ) ) 
                GROUP BY b.STIN,
                         b.ITC_PERIOD
           )
           c ON a.STIN = c.STIN AND 
                a.ITC_PERIOD = c.ITC_PERIOD
           LEFT JOIN
           (
               SELECT e.STIN,
                      e.ITC_PERIOD,
                      sum(e.igst + e.sgst + e.cgst + e.cess) AS CAMT
                 FROM ANX2_3AG e
                WHERE FLG !='X' AND (e.IS_ITC_ENTL NOT IN ('N', 'N/Y') AND 
                       CLM_REF != 'Y') AND 
                      e.DOCTYPE = 'CN' AND 
                      (e.ACTION_TAKEN = 'R' OR 
                       ( (e.ACTION_TAKEN = '' OR 
                          e.ACTION_TAKEN IS NULL) AND 
                         (e.PORTAL_STAT = 'R') ) ) 
                GROUP BY e.STIN,
                         e.ITC_PERIOD
           )
           d ON a.STIN = d.STIN AND 
                a.ITC_PERIOD = d.ITC_PERIOD
     ORDER BY a.STIN;`,

     pending: `CREATE VIEW ANX2_3G_SUMM_P AS
     SELECT a.STIN,
            a.TRDNAME,
            a.PCOUNT,
            (IFNULL(c.IDAMT, 0) - IFNULL(d.CAMT, 0) ) AS PTAXAMT,
            a.ITC_PERIOD AS PITC
       FROM (
                SELECT STIN,
                       TRDNAME,
                       ITC_PERIOD,
                       count(1) AS PCOUNT
                  FROM ANX2_3AG
                 WHERE FLG !='X' AND (ACTION_TAKEN = 'P' OR 
                        ( (ACTION_TAKEN = '' OR 
                           ACTION_TAKEN IS NULL) AND 
                          (PORTAL_STAT = 'P') ) OR 
                        (S_RETURN_STAT = 'NF (ITC-NA)' AND 
                         ( (ACTION_TAKEN IN ('', 'S') OR 
                            ACTION_TAKEN IS NULL) AND 
                           (PORTAL_STAT IN ('A', '') OR 
                            PORTAL_STAT IS NULL) ) ) ) 
                 GROUP BY STIN,
                          ITC_PERIOD
            )
            a
            LEFT JOIN
            (
                SELECT b.STIN,
                       b.ITC_PERIOD,
                       sum(b.igst + b.sgst + b.cgst + b.cess) AS IDAMT
                  FROM ANX2_3AG b
                 WHERE FLG !='X' AND b.IS_ITC_ENTL NOT IN ('N', 'N/Y') AND 
                       CLM_REF != 'Y' AND 
                       b.DOCTYPE IN ('I', 'DN') AND 
                       (b.ACTION_TAKEN = 'P' OR 
                        ( (b.ACTION_TAKEN = '' OR 
                           b.ACTION_TAKEN IS NULL) AND 
                          (b.PORTAL_STAT = 'P') ) OR 
                        (b.S_RETURN_STAT = 'NF (ITC-NA)' AND 
                         ( (b.ACTION_TAKEN IN ('', 'S') OR 
                            b.ACTION_TAKEN IS NULL) AND 
                           (b.PORTAL_STAT IN ('A', '') OR 
                            b.PORTAL_STAT IS NULL) ) ) ) 
                 GROUP BY b.STIN,
                          b.ITC_PERIOD
            )
            c ON a.STIN = c.STIN AND 
                 a.ITC_PERIOD = c.ITC_PERIOD
            LEFT JOIN
            (
                SELECT e.STIN,
                       e.ITC_PERIOD,
                       sum(e.igst + e.sgst + e.cgst + e.cess) AS CAMT
                  FROM ANX2_3AG e
                 WHERE FLG !='X' AND e.IS_ITC_ENTL NOT IN ('N', 'N/Y') AND 
                       CLM_REF != 'Y' AND 
                       e.DOCTYPE = 'CN' AND 
                       (e.ACTION_TAKEN = 'P' OR 
                        ( (e.ACTION_TAKEN = '' OR 
                           e.ACTION_TAKEN IS NULL) AND 
                          (e.PORTAL_STAT = 'P') ) OR 
                        (e.S_RETURN_STAT = 'NF (ITC-NA)' AND 
                         ( (e.ACTION_TAKEN IN ('', 'S') OR 
                            e.ACTION_TAKEN IS NULL) AND 
                           (e.PORTAL_STAT IN ('A', '') OR 
                            e.PORTAL_STAT IS NULL) ) ) ) 
                 GROUP BY e.STIN,
                          e.ITC_PERIOD
            )
            d ON a.STIN = d.STIN AND 
                 a.ITC_PERIOD = d.ITC_PERIOD
      ORDER BY a.STIN;`,
      summaccept:
          `CREATE VIEW ANX2_3G_DSUMM_A AS
      SELECT a.COUNT AS count,
             (IFNULL(c.IDVAL, 0) - IFNULL(d.CVAL, 0) ) AS taxval,
             (IFNULL(f.IIGST, 0) - IFNULL(g.CIGST, 0) ) AS igst,
             (IFNULL(f.ICGST, 0) - IFNULL(g.CCGST, 0) ) AS cgst,
             (IFNULL(f.ISGST, 0) - IFNULL(g.CSGST, 0) ) AS sgst,
             (IFNULL(f.ICESS, 0) - IFNULL(g.CCESS, 0) ) AS cess,
             a.ITC_PERIOD
        FROM (
                 SELECT ITC_PERIOD,
                        count(1) AS COUNT
                   FROM ANX2_3AG
                  WHERE FLG !='X' AND S_RETURN_STAT != 'NF (ITC-NA)' AND 
                        (ACTION_TAKEN = 'A' OR 
                         ( (ACTION_TAKEN IN ('', 'S') OR 
                            ACTION_TAKEN IS NULL) AND 
                           (PORTAL_STAT IN ('A', '') OR 
                            PORTAL_STAT IS NULL) ) OR 
                         (ACTION_TAKEN = 'S' AND 
                          PORTAL_STAT IN ('P', 'R') ) ) 
                  GROUP BY ITC_PERIOD
             )
             a
             LEFT JOIN
             (
                 SELECT ITC_PERIOD,
                        SUM(TAX_VALUE) AS IDVAL
                   FROM ANX2_3AG b
                  WHERE FLG !='X' AND b.S_RETURN_STAT != 'NF (ITC-NA)' AND 
                        b.DOCTYPE IN ('I', 'DN') AND 
                        (b.ACTION_TAKEN = 'A' OR 
                         ( (b.ACTION_TAKEN IN ('', 'S') OR 
                            b.ACTION_TAKEN IS NULL) AND 
                           (b.PORTAL_STAT IN ('A', '') OR 
                            b.PORTAL_STAT IS NULL) ) OR 
                         (b.ACTION_TAKEN = 'S' AND 
                          b.PORTAL_STAT IN ('P', 'R') ) ) 
                  GROUP BY b.ITC_PERIOD
             )
             c ON a.ITC_PERIOD = c.ITC_PERIOD
             LEFT JOIN
             (
                 SELECT ITC_PERIOD,
                        SUM(TAX_VALUE) AS CVAL
                   FROM ANX2_3AG e
                  WHERE FLG !='X' AND e.S_RETURN_STAT != 'NF (ITC-NA)' AND 
                        e.DOCTYPE = 'CN' AND 
                        (e.ACTION_TAKEN = 'A' OR 
                         ( (e.ACTION_TAKEN IN ('', 'S') OR 
                            e.ACTION_TAKEN IS NULL) AND 
                           (e.PORTAL_STAT IN ('A', '') OR 
                            e.PORTAL_STAT IS NULL) ) OR 
                         (e.ACTION_TAKEN = 'S' AND 
                          e.PORTAL_STAT IN ('P', 'R') ) ) 
                  GROUP BY e.ITC_PERIOD
             )
             d ON (a.ITC_PERIOD = d.ITC_PERIOD) 
             LEFT JOIN
             (
                 SELECT ITC_PERIOD,
                        SUM(IGST) AS IIGST,
                        SUM(CGST) AS ICGST,
                        SUM(SGST) AS ISGST,
                        SUM(CESS) AS ICESS
                   FROM ANX2_3AG
                  WHERE FLG !='X' AND (S_RETURN_STAT != 'NF (ITC-NA)' AND 
                         IS_ITC_ENTL NOT IN ('N', 'N/Y') AND 
                         CLM_REF != 'Y') AND 
                        DOCTYPE IN ('I', 'DN') AND 
                        (ACTION_TAKEN = 'A' OR 
                         ( (ACTION_TAKEN IN ('', 'S') OR 
                            ACTION_TAKEN IS NULL) AND 
                           (PORTAL_STAT IN ('A', '') OR 
                            PORTAL_STAT IS NULL) ) ) 
                  GROUP BY ITC_PERIOD
             )
             f ON a.ITC_PERIOD = f.ITC_PERIOD
             LEFT JOIN
             (
                 SELECT ITC_PERIOD,
                        SUM(IGST) AS CIGST,
                        SUM(CGST) AS CCGST,
                        SUM(SGST) AS CSGST,
                        SUM(CESS) AS CCESS
                   FROM ANX2_3AG
                  WHERE FLG !='X' AND (S_RETURN_STAT != 'NF (ITC-NA)' AND 
                         IS_ITC_ENTL NOT IN ('N', 'N/Y') AND 
                         CLM_REF != 'Y') AND 
                        DOCTYPE = 'CN' AND 
                        (ACTION_TAKEN = 'A' OR 
                         ( (ACTION_TAKEN IN ('', 'S') OR 
                            ACTION_TAKEN IS NULL) AND 
                           (PORTAL_STAT IN ('A', '') OR 
                            PORTAL_STAT IS NULL) ) ) 
                  GROUP BY ITC_PERIOD
             )
             g ON a.ITC_PERIOD = g.ITC_PERIOD;`,

     summreject:
          `CREATE VIEW ANX2_3G_DSUMM_R AS
             SELECT a.COUNT AS count,
                    (IFNULL(c.IDVAL, 0) - IFNULL(d.CVAL, 0) ) AS taxval,
                    (IFNULL(f.IIGST, 0) - IFNULL(g.CIGST, 0) ) AS igst,
                    (IFNULL(f.ICGST, 0) - IFNULL(g.CCGST, 0) ) AS cgst,
                    (IFNULL(f.ISGST, 0) - IFNULL(g.CSGST, 0) ) AS sgst,
                    (IFNULL(f.ICESS, 0) - IFNULL(g.CCESS, 0) ) AS cess,
                    a.ITC_PERIOD
               FROM (
                        SELECT ITC_PERIOD,
                               count(1) AS COUNT
                          FROM ANX2_3AG
                         WHERE FLG !='X' AND (ACTION_TAKEN = 'R' OR 
                                ( (ACTION_TAKEN = '' OR 
                                   ACTION_TAKEN IS NULL) AND 
                                  (PORTAL_STAT = 'R') ) ) 
                         GROUP BY ITC_PERIOD
                    )
                    a
                    LEFT JOIN
                    (
                        SELECT ITC_PERIOD,
                               SUM(TAX_VALUE) AS IDVAL
                          FROM ANX2_3AG b
                         WHERE FLG !='X' AND b.DOCTYPE IN ('I', 'DN') AND 
                               (b.ACTION_TAKEN = 'R' OR 
                                ( (b.ACTION_TAKEN = '' OR 
                                   b.ACTION_TAKEN IS NULL) AND 
                                  (b.PORTAL_STAT = 'R') ) ) 
                         GROUP BY b.ITC_PERIOD
                    )
                    c ON a.ITC_PERIOD = c.ITC_PERIOD
                    LEFT JOIN
                    (
                        SELECT ITC_PERIOD,
                               SUM(TAX_VALUE) AS CVAL
                          FROM ANX2_3AG e
                         WHERE FLG !='X' AND e.DOCTYPE = 'CN' AND 
                               (e.ACTION_TAKEN = 'R' OR 
                                ( (e.ACTION_TAKEN = '' OR 
                                   e.ACTION_TAKEN IS NULL) AND 
                                  (e.PORTAL_STAT = 'R') ) ) 
                         GROUP BY e.ITC_PERIOD
                    )
                    d ON (a.ITC_PERIOD = d.ITC_PERIOD) 
                    LEFT JOIN
                    (
                        SELECT ITC_PERIOD,
                               SUM(IGST) AS IIGST,
                               SUM(CGST) AS ICGST,
                               SUM(SGST) AS ISGST,
                               SUM(CESS) AS ICESS
                          FROM ANX2_3AG
                         WHERE FLG !='X' AND (IS_ITC_ENTL NOT IN ('N', 'N/Y') AND 
                                CLM_REF != 'Y') AND 
                               DOCTYPE IN ('I', 'DN') AND 
                               (ACTION_TAKEN = 'R' OR 
                                ( (ACTION_TAKEN = '' OR 
                                   ACTION_TAKEN IS NULL) AND 
                                  (PORTAL_STAT = 'R') ) ) 
                         GROUP BY ITC_PERIOD
                    )
                    f ON a.ITC_PERIOD = f.ITC_PERIOD
                    LEFT JOIN
                    (
                        SELECT ITC_PERIOD,
                               SUM(IGST) AS CIGST,
                               SUM(CGST) AS CCGST,
                               SUM(SGST) AS CSGST,
                               SUM(CESS) AS CCESS
                          FROM ANX2_3AG
                         WHERE FLG !='X' AND (IS_ITC_ENTL NOT IN ('N', 'N/Y') AND 
                                CLM_REF != 'Y') AND 
                               DOCTYPE = 'CN' AND 
                               (ACTION_TAKEN = 'R' OR 
                                ( (ACTION_TAKEN = '' OR 
                                   ACTION_TAKEN IS NULL) AND 
                                  (PORTAL_STAT = 'R') ) ) 
                         GROUP BY ITC_PERIOD
                    )
                    g ON a.ITC_PERIOD = g.ITC_PERIOD;`,

     summpending:
          `CREATE VIEW ANX2_3G_DSUMM_P AS
                    SELECT a.COUNT AS count,
                           (IFNULL(c.IDVAL, 0) - IFNULL(d.CVAL, 0) ) AS taxval,
                           (IFNULL(f.IIGST, 0) - IFNULL(g.CIGST, 0) ) AS igst,
                           (IFNULL(f.ICGST, 0) - IFNULL(g.CCGST, 0) ) AS cgst,
                           (IFNULL(f.ISGST, 0) - IFNULL(g.CSGST, 0) ) AS sgst,
                           (IFNULL(f.ICESS, 0) - IFNULL(g.CCESS, 0) ) AS cess,
                           a.ITC_PERIOD
                      FROM (
                               SELECT ITC_PERIOD,
                                      count(1) AS COUNT
                                 FROM ANX2_3AG
                                WHERE FLG !='X' AND (ACTION_TAKEN = 'P' OR 
                                       ( (ACTION_TAKEN = '' OR 
                                          ACTION_TAKEN IS NULL) AND 
                                         (PORTAL_STAT = 'P') ) OR 
                                       (S_RETURN_STAT = 'NF (ITC-NA)' AND 
                                        ( (ACTION_TAKEN IN ('', 'S') OR 
                                           ACTION_TAKEN IS NULL) AND 
                                          (PORTAL_STAT IN ('A', '') OR 
                                           PORTAL_STAT IS NULL) ) ) ) 
                                GROUP BY ITC_PERIOD
                           )
                           a
                           LEFT JOIN
                           (
                               SELECT ITC_PERIOD,
                                      SUM(TAX_VALUE) AS IDVAL
                                 FROM ANX2_3AG b
                                WHERE FLG !='X' AND b.DOCTYPE IN ('I', 'DN') AND 
                                      (b.ACTION_TAKEN = 'P' OR 
                                       ( (b.ACTION_TAKEN = '' OR 
                                          b.ACTION_TAKEN IS NULL) AND 
                                         (b.PORTAL_STAT = 'P') ) OR 
                                       (b.S_RETURN_STAT = 'NF (ITC-NA)' AND 
                                        ( (b.ACTION_TAKEN IN ('', 'S') OR 
                                           b.ACTION_TAKEN IS NULL) AND 
                                          (b.PORTAL_STAT IN ('A', '') OR 
                                           b.PORTAL_STAT IS NULL) ) ) ) 
                                GROUP BY b.ITC_PERIOD
                           )
                           c ON a.ITC_PERIOD = c.ITC_PERIOD
                           LEFT JOIN
                           (
                               SELECT ITC_PERIOD,
                                      SUM(TAX_VALUE) AS CVAL
                                 FROM ANX2_3AG e
                                WHERE FLG !='X' AND e.DOCTYPE = 'CN' AND 
                                      (e.ACTION_TAKEN = 'P' OR 
                                       ( (e.ACTION_TAKEN = '' OR 
                                          e.ACTION_TAKEN IS NULL) AND 
                                         (e.PORTAL_STAT = 'P') ) OR 
                                       (e.S_RETURN_STAT = 'NF (ITC-NA)' AND 
                                        ( (e.ACTION_TAKEN IN ('', 'S') OR 
                                           e.ACTION_TAKEN IS NULL) AND 
                                          (e.PORTAL_STAT IN ('A', '') OR 
                                           e.PORTAL_STAT IS NULL) ) ) ) 
                                GROUP BY e.ITC_PERIOD
                           )
                           d ON (a.ITC_PERIOD = d.ITC_PERIOD) 
                           LEFT JOIN
                           (
                               SELECT ITC_PERIOD,
                                      SUM(IGST) AS IIGST,
                                      SUM(CGST) AS ICGST,
                                      SUM(SGST) AS ISGST,
                                      SUM(CESS) AS ICESS
                                 FROM ANX2_3AG
                                WHERE FLG !='X' AND (IS_ITC_ENTL NOT IN ('N', 'N/Y') AND 
                                       CLM_REF != 'Y') AND 
                                      DOCTYPE IN ('I', 'DN') AND 
                                      (ACTION_TAKEN = 'P' OR 
                                       ( (ACTION_TAKEN = '' OR 
                                          ACTION_TAKEN IS NULL) AND 
                                         (PORTAL_STAT = 'P') ) OR 
                                       (S_RETURN_STAT = 'NF (ITC-NA)' AND 
                                        ( (ACTION_TAKEN IN ('', 'S') OR 
                                           ACTION_TAKEN IS NULL) AND 
                                          (PORTAL_STAT IN ('A', '') OR 
                                           PORTAL_STAT IS NULL) ) ) ) 
                                GROUP BY ITC_PERIOD
                           )
                           f ON a.ITC_PERIOD = f.ITC_PERIOD
                           LEFT JOIN
                           (
                               SELECT ITC_PERIOD,
                                      SUM(IGST) AS CIGST,
                                      SUM(CGST) AS CCGST,
                                      SUM(SGST) AS CSGST,
                                      SUM(CESS) AS CCESS
                                 FROM ANX2_3AG
                                WHERE FLG !='X' AND (IS_ITC_ENTL NOT IN ('N', 'N/Y') AND 
                                       CLM_REF != 'Y') AND 
                                      DOCTYPE = 'CN' AND 
                                      (ACTION_TAKEN = 'P' OR 
                                       ( (ACTION_TAKEN = '' OR 
                                          ACTION_TAKEN IS NULL) AND 
                                         (PORTAL_STAT = 'P') ) OR 
                                       (S_RETURN_STAT = 'NF (ITC-NA)' AND 
                                        ( (ACTION_TAKEN IN ('', 'S') OR 
                                           ACTION_TAKEN IS NULL) AND 
                                          (PORTAL_STAT IN ('A', '') OR 
                                           PORTAL_STAT IS NULL) ) ) ) 
                                GROUP BY ITC_PERIOD
                           )
                           g ON a.ITC_PERIOD = g.ITC_PERIOD;`,

        erraccept:`CREATE VIEW ANX2_3G_ERR_SUMM_A AS
            SELECT a.STIN,
                   a.TRDNAME,
                   a.ACOUNT,
                   (IFNULL(c.IDAMT, 0) - IFNULL(d.CAMT, 0) ) AS ATAXAMT,
                   (IFNULL(e.AECOUNT, 0) ) AS AECOUNT,
                   a.ITC_PERIOD AS AITC
              FROM (
                       SELECT STIN,
                              TRDNAME,
                              ITC_PERIOD,
                              count(1) AS ACOUNT
                         FROM ANX2_3AG
                        WHERE (FLG = 'X' OR 
                               ERROR_CODE IS NOT NULL) AND 
                              S_RETURN_STAT != 'NF (ITC-NA)' AND 
                              (ACTION_TAKEN = 'A' OR 
                               ( (ACTION_TAKEN IN ('', 'S') OR 
                                  ACTION_TAKEN IS NULL) AND 
                                 (PORTAL_STAT IN ('A', '') OR 
                                  PORTAL_STAT IS NULL) ) OR 
                               (ACTION_TAKEN = 'S' AND 
                                PORTAL_STAT IN ('P', 'R') ) ) 
                        GROUP BY STIN,
                                 ITC_PERIOD
                   )
                   a
                   LEFT JOIN
                   (
                       SELECT STIN,
                              ITC_PERIOD,
                              sum(b.igst + b.sgst + b.cgst + b.cess) AS IDAMT
                         FROM ANX2_3AG b
                        WHERE (FLG = 'X' OR 
                               ERROR_CODE IS NOT NULL) AND 
                              (b.S_RETURN_STAT != 'NF (ITC-NA)' AND 
                               b.IS_ITC_ENTL NOT IN ('N', 'N/Y') AND 
                               CLM_REF != 'Y') AND 
                              b.DOCTYPE IN ('I', 'DN') AND 
                              (b.ACTION_TAKEN = 'A' OR 
                               ( (b.ACTION_TAKEN IN ('', 'S') OR 
                                  b.ACTION_TAKEN IS NULL) AND 
                                 (b.PORTAL_STAT IN ('A', '') OR 
                                  b.PORTAL_STAT IS NULL) ) OR 
                               (b.ACTION_TAKEN = 'S' AND 
                                b.PORTAL_STAT IN ('P', 'R') ) ) 
                        GROUP BY b.STIN,
                                 b.ITC_PERIOD
                   )
                   c ON a.STIN = c.STIN AND 
                        a.ITC_PERIOD = c.ITC_PERIOD
                   LEFT JOIN
                   (
                       SELECT STIN,
                              ITC_PERIOD,
                              sum(e.igst + e.sgst + e.cgst + e.cess) AS CAMT
                         FROM ANX2_3AG e
                        WHERE (FLG = 'X' OR 
                               ERROR_CODE IS NOT NULL) AND 
                              (e.S_RETURN_STAT != 'NF (ITC-NA)' AND 
                               e.IS_ITC_ENTL NOT IN ('N', 'N/Y') AND 
                               CLM_REF != 'Y') AND 
                              e.DOCTYPE = 'CN' AND 
                              (e.ACTION_TAKEN = 'A' OR 
                               ( (e.ACTION_TAKEN IN ('', 'S') OR 
                                  e.ACTION_TAKEN IS NULL) AND 
                                 (e.PORTAL_STAT IN ('A', '') OR 
                                  e.PORTAL_STAT IS NULL) ) OR 
                               (e.ACTION_TAKEN = 'S' AND 
                                e.PORTAL_STAT IN ('P', 'R') ) ) 
                        GROUP BY e.STIN,
                                 e.ITC_PERIOD
                   )
                   d ON (a.STIN = d.STIN AND 
                         a.ITC_PERIOD = d.ITC_PERIOD) 
                   LEFT JOIN
                   (
                       SELECT STIN,
                              TRDNAME,
                              ITC_PERIOD,
                              count(1) AS AECOUNT
                         FROM ANX2_3AG
                        WHERE FLG = 'X' AND 
                              S_RETURN_STAT != 'NF (ITC-NA)' AND 
                              (ACTION_TAKEN = 'A' OR 
                               ( (ACTION_TAKEN IN ('', 'S') OR 
                                  ACTION_TAKEN IS NULL) AND 
                                 (PORTAL_STAT IN ('A', '') OR 
                                  PORTAL_STAT IS NULL) ) OR 
                               (ACTION_TAKEN = 'S' AND 
                                PORTAL_STAT IN ('P', 'R') ) ) 
                        GROUP BY STIN,
                                 ITC_PERIOD
                   )
                   e ON a.STIN = e.STIN AND 
                        a.ITC_PERIOD = e.ITC_PERIOD
             ORDER BY a.STIN;`,

        errpending:`CREATE VIEW ANX2_3G_ERR_SUMM_P AS
    SELECT a.STIN,
           a.TRDNAME,
           a.PCOUNT,
           (IFNULL(c.IDAMT, 0) - IFNULL(d.CAMT, 0) ) AS PTAXAMT,
           (IFNULL(e.PECOUNT, 0) ) AS PECOUNT,
           a.ITC_PERIOD AS PITC
      FROM (
               SELECT STIN,
                      TRDNAME,
                      ITC_PERIOD,
                      count(1) AS PCOUNT
                 FROM ANX2_3AG
                WHERE (FLG = 'X' OR 
                       ERROR_CODE IS NOT NULL) AND 
                      (ACTION_TAKEN = 'P' OR 
                       ( (ACTION_TAKEN = '' OR 
                          ACTION_TAKEN IS NULL) AND 
                         (PORTAL_STAT = 'P') ) OR 
                       (S_RETURN_STAT = 'NF (ITC-NA)' AND 
                        ( (ACTION_TAKEN IN ('', 'S') OR 
                           ACTION_TAKEN IS NULL) AND 
                          (PORTAL_STAT IN ('A', '') OR 
                           PORTAL_STAT IS NULL) ) ) ) 
                GROUP BY STIN,
                         ITC_PERIOD
           )
           a
           LEFT JOIN
           (
               SELECT b.STIN,
                      b.ITC_PERIOD,
                      sum(b.igst + b.sgst + b.cgst + b.cess) AS IDAMT
                 FROM ANX2_3AG b
                WHERE (FLG = 'X' OR 
                       ERROR_CODE IS NOT NULL) AND 
                      b.IS_ITC_ENTL NOT IN ('N', 'N/Y') AND 
                      CLM_REF != 'Y' AND 
                      b.DOCTYPE IN ('I', 'DN') AND 
                      (b.ACTION_TAKEN = 'P' OR 
                       ( (b.ACTION_TAKEN = '' OR 
                          b.ACTION_TAKEN IS NULL) AND 
                         (b.PORTAL_STAT = 'P') ) OR 
                       (b.S_RETURN_STAT = 'NF (ITC-NA)' AND 
                        ( (b.ACTION_TAKEN IN ('', 'S') OR 
                           b.ACTION_TAKEN IS NULL) AND 
                          (b.PORTAL_STAT IN ('A', '') OR 
                           b.PORTAL_STAT IS NULL) ) ) ) 
                GROUP BY b.STIN,
                         b.ITC_PERIOD
           )
           c ON a.STIN = c.STIN AND 
                a.ITC_PERIOD = c.ITC_PERIOD
           LEFT JOIN
           (
               SELECT e.STIN,
                      e.ITC_PERIOD,
                      sum(e.igst + e.sgst + e.cgst + e.cess) AS CAMT
                 FROM ANX2_3AG e
                WHERE (FLG = 'X' OR 
                       ERROR_CODE IS NOT NULL) AND 
                      e.IS_ITC_ENTL NOT IN ('N', 'N/Y') AND 
                      CLM_REF != 'Y' AND 
                      e.DOCTYPE = 'CN' AND 
                      (e.ACTION_TAKEN = 'P' OR 
                       ( (e.ACTION_TAKEN = '' OR 
                          e.ACTION_TAKEN IS NULL) AND 
                         (e.PORTAL_STAT = 'P') ) OR 
                       (e.S_RETURN_STAT = 'NF (ITC-NA)' AND 
                        ( (e.ACTION_TAKEN IN ('', 'S') OR 
                           e.ACTION_TAKEN IS NULL) AND 
                          (e.PORTAL_STAT IN ('A', '') OR 
                           e.PORTAL_STAT IS NULL) ) ) ) 
                GROUP BY e.STIN,
                         e.ITC_PERIOD
           )
           d ON a.STIN = d.STIN AND 
                a.ITC_PERIOD = d.ITC_PERIOD
           LEFT JOIN
           (
               SELECT STIN,
                      TRDNAME,
                      ITC_PERIOD,
                      count(1) AS PECOUNT
                 FROM ANX2_3AG
                WHERE FLG = 'X' AND 
                      (ACTION_TAKEN = 'P' OR 
                       ( (ACTION_TAKEN = '' OR 
                          ACTION_TAKEN IS NULL) AND 
                         (PORTAL_STAT = 'P') ) OR 
                       (S_RETURN_STAT = 'NF (ITC-NA)' AND 
                        ( (ACTION_TAKEN IN ('', 'S') OR 
                           ACTION_TAKEN IS NULL) AND 
                          (PORTAL_STAT IN ('A', '') OR 
                           PORTAL_STAT IS NULL) ) ) ) 
                GROUP BY STIN,
                         ITC_PERIOD
           )
           e ON a.STIN = e.STIN AND 
                a.ITC_PERIOD = e.ITC_PERIOD
     ORDER BY a.STIN;`,

     errreject:`CREATE VIEW ANX2_3G_ERR_SUMM_R AS
    SELECT a.STIN,
           a.TRDNAME,
           a.RCOUNT,
           (IFNULL(c.IDAMT, 0) - IFNULL(d.CAMT, 0) ) AS RTAXAMT,
           (IFNULL(e.RECOUNT, 0) ) AS RECOUNT,
           a.ITC_PERIOD AS RITC
      FROM (
               SELECT STIN,
                      TRDNAME,
                      ITC_PERIOD,
                      count(1) AS RCOUNT
                 FROM ANX2_3AG
                WHERE (FLG = 'X' OR 
                       ERROR_CODE IS NOT NULL) AND 
                      (ACTION_TAKEN = 'R' OR 
                       ( (ACTION_TAKEN = '' OR 
                          ACTION_TAKEN IS NULL) AND 
                         (PORTAL_STAT = 'R') ) ) 
                GROUP BY STIN,
                         ITC_PERIOD
           )
           a
           LEFT JOIN
           (
               SELECT STIN,
                      ITC_PERIOD,
                      sum(b.igst + b.sgst + b.cgst + b.cess) AS IDAMT
                 FROM ANX2_3AG b
                WHERE (FLG = 'X' OR 
                       ERROR_CODE IS NOT NULL) AND 
                      (b.IS_ITC_ENTL NOT IN ('N', 'N/Y') AND 
                       CLM_REF != 'Y') AND 
                      b.DOCTYPE IN ('I', 'DN') AND 
                      (b.ACTION_TAKEN = 'R' OR 
                       ( (b.ACTION_TAKEN = '' OR 
                          b.ACTION_TAKEN IS NULL) AND 
                         (b.PORTAL_STAT = 'R') ) ) 
                GROUP BY b.STIN,
                         b.ITC_PERIOD
           )
           c ON a.STIN = c.STIN AND 
                a.ITC_PERIOD = c.ITC_PERIOD
           LEFT JOIN
           (
               SELECT e.STIN,
                      e.ITC_PERIOD,
                      sum(e.igst + e.sgst + e.cgst + e.cess) AS CAMT
                 FROM ANX2_3AG e
                WHERE (FLG = 'X' OR 
                       ERROR_CODE IS NOT NULL) AND 
                      (e.IS_ITC_ENTL NOT IN ('N', 'N/Y') AND 
                       CLM_REF != 'Y') AND 
                      e.DOCTYPE = 'CN' AND 
                      (e.ACTION_TAKEN = 'R' OR 
                       ( (e.ACTION_TAKEN = '' OR 
                          e.ACTION_TAKEN IS NULL) AND 
                         (e.PORTAL_STAT = 'R') ) ) 
                GROUP BY e.STIN,
                         e.ITC_PERIOD
           )
           d ON a.STIN = d.STIN AND 
                a.ITC_PERIOD = d.ITC_PERIOD
           LEFT JOIN
           (
               SELECT STIN,
                      TRDNAME,
                      ITC_PERIOD,
                      count(1) AS RECOUNT
                 FROM ANX2_3AG
                WHERE FLG = 'X' AND 
                      (ACTION_TAKEN = 'R' OR 
                       ( (ACTION_TAKEN = '' OR 
                          ACTION_TAKEN IS NULL) AND 
                         (PORTAL_STAT = 'R') ) ) 
                GROUP BY STIN,
                         ITC_PERIOD
           )
           e ON a.STIN = e.STIN AND 
                a.ITC_PERIOD = e.ITC_PERIOD
     ORDER BY a.STIN;`
}


const sezwp = {

    accept: `CREATE VIEW ANX2_3E_SUMM_A AS
    SELECT a.STIN,
           a.TRDNAME,
           a.ACOUNT,
           (IFNULL(c.IDAMT, 0) - IFNULL(d.CAMT, 0) ) AS ATAXAMT,
           a.ITC_PERIOD AS AITC
      FROM (
               SELECT STIN,
                      TRDNAME,
                      ITC_PERIOD,
                      count(1) AS ACOUNT
                 FROM ANX2_3AE
                WHERE FLG !='X' AND S_RETURN_STAT != 'NF (ITC-NA)' AND 
                      (ACTION_TAKEN = 'A' OR 
                       ( (ACTION_TAKEN IN ('', 'S') OR 
                          ACTION_TAKEN IS NULL) AND 
                         (PORTAL_STAT IN ('A', '') OR 
                          PORTAL_STAT IS NULL) ) OR 
                       (ACTION_TAKEN = 'S' AND 
                        PORTAL_STAT IN ('P', 'R') ) ) 
                GROUP BY STIN,
                         ITC_PERIOD
           )
           a
           LEFT JOIN
           (
               SELECT STIN,
                      ITC_PERIOD,
                      sum(b.igst + b.cess) AS IDAMT
                 FROM ANX2_3AE b
                WHERE FLG !='X' AND (b.S_RETURN_STAT != 'NF (ITC-NA)' AND 
                       b.IS_ITC_ENTL NOT IN ('N', 'N/Y') AND 
                       b.CLM_REF != 'Y') AND 
                      b.DOCTYPE IN ('I', 'DN') AND 
                      (b.ACTION_TAKEN = 'A' OR 
                       ( (b.ACTION_TAKEN IN ('', 'S') OR 
                          b.ACTION_TAKEN IS NULL) AND 
                         (b.PORTAL_STAT IN ('A', '') OR 
                          b.PORTAL_STAT IS NULL) ) OR 
                       (b.ACTION_TAKEN = 'S' AND 
                        b.PORTAL_STAT IN ('P', 'R') ) ) 
                GROUP BY b.STIN,
                         b.ITC_PERIOD
           )
           c ON a.STIN = c.STIN AND 
                a.ITC_PERIOD = c.ITC_PERIOD
           LEFT JOIN
           (
               SELECT STIN,
                      ITC_PERIOD,
                      sum(e.igst + e.cess) AS CAMT
                 FROM ANX2_3AE e
                WHERE FLG !='X' AND (e.S_RETURN_STAT != 'NF (ITC-NA)' AND 
                       e.IS_ITC_ENTL NOT IN ('N', 'N/Y') AND 
                       e.CLM_REF != 'Y') AND 
                      e.DOCTYPE = 'CN' AND 
                      (e.ACTION_TAKEN = 'A' OR 
                       ( (e.ACTION_TAKEN IN ('', 'S') OR 
                          e.ACTION_TAKEN IS NULL) AND 
                         (e.PORTAL_STAT IN ('A', '') OR 
                          e.PORTAL_STAT IS NULL) ) OR 
                       (e.ACTION_TAKEN = 'S' AND 
                        e.PORTAL_STAT IN ('P', 'R') ) ) 
                GROUP BY e.STIN,
                         e.ITC_PERIOD
           )
           d ON (a.STIN = d.STIN AND 
                 a.ITC_PERIOD = d.ITC_PERIOD) 
     ORDER BY a.STIN;`,

    reject: `CREATE VIEW ANX2_3E_SUMM_R AS
     SELECT a.STIN,
            a.TRDNAME,
            a.RCOUNT,
            (IFNULL(c.IDAMT, 0) - IFNULL(d.CAMT, 0) ) AS RTAXAMT,
            a.ITC_PERIOD AS RITC
       FROM (
                SELECT STIN,
                       TRDNAME,
                       ITC_PERIOD,
                       count(1) AS RCOUNT
                  FROM ANX2_3AE
                 WHERE FLG !='X' AND (ACTION_TAKEN = 'R' OR 
                        ( (ACTION_TAKEN = '' OR 
                           ACTION_TAKEN IS NULL) AND 
                          (PORTAL_STAT = 'R') ) ) 
                 GROUP BY STIN,
                          ITC_PERIOD
            )
            a
            LEFT JOIN
            (
                SELECT STIN,
                       ITC_PERIOD,
                       sum(b.igst + b.cess) AS IDAMT
                  FROM ANX2_3AE b
                 WHERE FLG !='X' AND (b.IS_ITC_ENTL NOT IN ('N', 'N/Y') AND 
                        b.CLM_REF != 'Y') AND 
                       b.DOCTYPE IN ('I', 'DN') AND 
                       (b.ACTION_TAKEN = 'R' OR 
                        ( (b.ACTION_TAKEN = '' OR 
                           b.ACTION_TAKEN IS NULL) AND 
                          (b.PORTAL_STAT = 'R') ) ) 
                 GROUP BY b.STIN,
                          b.ITC_PERIOD
            )
            c ON a.STIN = c.STIN AND 
                 a.ITC_PERIOD = c.ITC_PERIOD
            LEFT JOIN
            (
                SELECT e.STIN,
                       e.ITC_PERIOD,
                       sum(e.igst + e.cess) AS CAMT
                  FROM ANX2_3AE e
                 WHERE FLG !='X' AND (e.IS_ITC_ENTL NOT IN ('N', 'N/Y') AND 
                        e.CLM_REF != 'Y') AND 
                       e.DOCTYPE = 'CN' AND 
                       (e.ACTION_TAKEN = 'R' OR 
                        ( (e.ACTION_TAKEN = '' OR 
                           e.ACTION_TAKEN IS NULL) AND 
                          (e.PORTAL_STAT = 'R') ) ) 
                 GROUP BY e.STIN,
                          e.ITC_PERIOD
            )
            d ON a.STIN = d.STIN AND 
                 a.ITC_PERIOD = d.ITC_PERIOD
      ORDER BY a.STIN;`,

    pending: `CREATE VIEW ANX2_3E_SUMM_P AS
      SELECT a.STIN,
             a.TRDNAME,
             a.PCOUNT,
             (IFNULL(c.IDAMT, 0) - IFNULL(d.CAMT, 0) ) AS PTAXAMT,
             a.ITC_PERIOD AS PITC
        FROM (
                 SELECT STIN,
                        TRDNAME,
                        ITC_PERIOD,
                        count(1) AS PCOUNT
                   FROM ANX2_3AE
                  WHERE FLG !='X' AND (ACTION_TAKEN = 'P' OR 
                         ( (ACTION_TAKEN = '' OR 
                            ACTION_TAKEN IS NULL) AND 
                           (PORTAL_STAT = 'P') ) OR 
                         (S_RETURN_STAT = 'NF (ITC-NA)' AND 
                          ( (ACTION_TAKEN IN ('', 'S') OR 
                             ACTION_TAKEN IS NULL) AND 
                            (PORTAL_STAT IN ('A', '') OR 
                             PORTAL_STAT IS NULL) ) ) ) 
                  GROUP BY STIN,
                           ITC_PERIOD
             )
             a
             LEFT JOIN
             (
                 SELECT b.STIN,
                        b.ITC_PERIOD,
                        sum(b.igst + b.cess) AS IDAMT
                   FROM ANX2_3AE b
                  WHERE FLG !='X' AND (b.IS_ITC_ENTL NOT IN ('N', 'N/Y') AND 
                         b.CLM_REF != 'Y') AND 
                        b.DOCTYPE IN ('I', 'DN') AND 
                        (b.ACTION_TAKEN = 'P' OR 
                         ( (b.ACTION_TAKEN = '' OR 
                            b.ACTION_TAKEN IS NULL) AND 
                           (b.PORTAL_STAT = 'P') ) OR 
                         (b.S_RETURN_STAT = 'NF (ITC-NA)' AND 
                          ( (b.ACTION_TAKEN IN ('', 'S') OR 
                             b.ACTION_TAKEN IS NULL) AND 
                            (b.PORTAL_STAT IN ('A', '') OR 
                             b.PORTAL_STAT IS NULL) ) ) ) 
                  GROUP BY b.STIN,
                           b.ITC_PERIOD
             )
             c ON a.STIN = c.STIN AND 
                  a.ITC_PERIOD = c.ITC_PERIOD
             LEFT JOIN
             (
                 SELECT e.STIN,
                        e.ITC_PERIOD,
                        sum(e.igst + e.cess) AS CAMT
                   FROM ANX2_3AE e
                  WHERE FLG !='X' AND (e.IS_ITC_ENTL NOT IN ('N', 'N/Y') AND 
                         e.CLM_REF != 'Y') AND 
                        e.DOCTYPE = 'CN' AND 
                        (e.ACTION_TAKEN = 'P' OR 
                         ( (e.ACTION_TAKEN = '' OR 
                            e.ACTION_TAKEN IS NULL) AND 
                           (e.PORTAL_STAT = 'P') ) OR 
                         (e.S_RETURN_STAT = 'NF (ITC-NA)' AND 
                          ( (e.ACTION_TAKEN IN ('', 'S') OR 
                             e.ACTION_TAKEN IS NULL) AND 
                            (e.PORTAL_STAT IN ('A', '') OR 
                             e.PORTAL_STAT IS NULL) ) ) ) 
                  GROUP BY e.STIN,
                           e.ITC_PERIOD
             )
             d ON a.STIN = d.STIN AND 
                  a.ITC_PERIOD = d.ITC_PERIOD
       ORDER BY a.STIN;`,

        summaccept:
            `CREATE VIEW ANX2_3E_DSUMM_A AS
       SELECT a.COUNT AS count,
              (IFNULL(c.IDVAL, 0) - IFNULL(d.CVAL, 0) ) AS taxval,
              (IFNULL(f.IIGST, 0) - IFNULL(g.CIGST, 0) ) AS igst,
              (IFNULL(f.ICESS, 0) - IFNULL(g.CCESS, 0) ) AS cess,
              a.ITC_PERIOD
         FROM (
                  SELECT ITC_PERIOD,
                         count(1) AS COUNT
                    FROM ANX2_3AE
                   WHERE FLG !='X' AND S_RETURN_STAT != 'NF (ITC-NA)' AND 
                         (ACTION_TAKEN = 'A' OR 
                          ( (ACTION_TAKEN IN ('', 'S') OR 
                             ACTION_TAKEN IS NULL) AND 
                            (PORTAL_STAT IN ('A', '') OR 
                             PORTAL_STAT IS NULL) ) OR 
                          (ACTION_TAKEN = 'S' AND 
                           PORTAL_STAT IN ('P', 'R') ) ) 
                   GROUP BY ITC_PERIOD
              )
              a
              LEFT JOIN
              (
                  SELECT ITC_PERIOD,
                         SUM(TAX_VALUE) AS IDVAL
                    FROM ANX2_3AE b
                   WHERE FLG !='X' AND b.S_RETURN_STAT != 'NF (ITC-NA)' AND 
                         b.DOCTYPE IN ('I', 'DN') AND 
                         (b.ACTION_TAKEN = 'A' OR 
                          ( (b.ACTION_TAKEN IN ('', 'S') OR 
                             b.ACTION_TAKEN IS NULL) AND 
                            (b.PORTAL_STAT IN ('A', '') OR 
                             b.PORTAL_STAT IS NULL) ) OR 
                          (b.ACTION_TAKEN = 'S' AND 
                           b.PORTAL_STAT IN ('P', 'R') ) ) 
                   GROUP BY ITC_PERIOD
              )
              c ON a.ITC_PERIOD = c.ITC_PERIOD
              LEFT JOIN
              (
                  SELECT ITC_PERIOD,
                         SUM(TAX_VALUE) AS CVAL
                    FROM ANX2_3AE e
                   WHERE FLG !='X' AND e.S_RETURN_STAT != 'NF (ITC-NA)' AND 
                         e.DOCTYPE = 'CN' AND 
                         (e.ACTION_TAKEN = 'A' OR 
                          ( (e.ACTION_TAKEN IN ('', 'S') OR 
                             e.ACTION_TAKEN IS NULL) AND 
                            (e.PORTAL_STAT IN ('A', '') OR 
                             e.PORTAL_STAT IS NULL) ) OR 
                          (e.ACTION_TAKEN = 'S' AND 
                           e.PORTAL_STAT IN ('P', 'R') ) ) 
                   GROUP BY ITC_PERIOD
              )
              d ON (a.ITC_PERIOD = d.ITC_PERIOD) 
              LEFT JOIN
              (
                  SELECT ITC_PERIOD,
                         SUM(IGST) AS IIGST,
                         SUM(CESS) AS ICESS
                    FROM ANX2_3AE
                   WHERE FLG !='X' AND (S_RETURN_STAT != 'NF (ITC-NA)' AND 
                          IS_ITC_ENTL NOT IN ('N', 'N/Y') AND 
                          CLM_REF != 'Y') AND 
                         DOCTYPE IN ('I', 'DN') AND 
                         (ACTION_TAKEN = 'A' OR 
                          ( (ACTION_TAKEN IN ('', 'S') OR 
                             ACTION_TAKEN IS NULL) AND 
                            (PORTAL_STAT IN ('A', '') OR 
                             PORTAL_STAT IS NULL) ) ) 
                   GROUP BY ITC_PERIOD
              )
              f ON a.ITC_PERIOD = f.ITC_PERIOD
              LEFT JOIN
              (
                  SELECT ITC_PERIOD,
                         SUM(IGST) AS CIGST,
                         SUM(CESS) AS CCESS
                    FROM ANX2_3AE
                   WHERE FLG !='X' AND (S_RETURN_STAT != 'NF (ITC-NA)' AND 
                          IS_ITC_ENTL NOT IN ('N', 'N/Y') AND 
                          CLM_REF != 'Y') AND 
                         DOCTYPE = 'CN' AND 
                         (ACTION_TAKEN = 'A' OR 
                          ( (ACTION_TAKEN IN ('', 'S') OR 
                             ACTION_TAKEN IS NULL) AND 
                            (PORTAL_STAT IN ('A', '') OR 
                             PORTAL_STAT IS NULL) ) ) 
                   GROUP BY ITC_PERIOD
              )
              g ON a.ITC_PERIOD = g.ITC_PERIOD;`,

       summreject:
            `CREATE VIEW ANX2_3E_DSUMM_R AS
              SELECT a.COUNT AS count,
                     (IFNULL(c.IDVAL, 0) - IFNULL(d.CVAL, 0) ) AS taxval,
                     (IFNULL(f.IIGST, 0) - IFNULL(g.CIGST, 0) ) AS igst,
                     (IFNULL(f.ICESS, 0) - IFNULL(g.CCESS, 0) ) AS cess,
                     a.ITC_PERIOD
                FROM (
                         SELECT ITC_PERIOD,
                                count(1) AS COUNT
                           FROM ANX2_3AE
                          WHERE FLG !='X' AND (ACTION_TAKEN = 'R' OR 
                                 ( (ACTION_TAKEN = '' OR 
                                    ACTION_TAKEN IS NULL) AND 
                                   (PORTAL_STAT = 'R') ) ) 
                          GROUP BY ITC_PERIOD
                     )
                     a
                     LEFT JOIN
                     (
                         SELECT ITC_PERIOD,
                                SUM(TAX_VALUE) AS IDVAL
                           FROM ANX2_3AE b
                          WHERE FLG !='X' AND b.DOCTYPE IN ('I', 'DN') AND 
                                (b.ACTION_TAKEN = 'R' OR 
                                 ( (b.ACTION_TAKEN = '' OR 
                                    b.ACTION_TAKEN IS NULL) AND 
                                   (b.PORTAL_STAT = 'R') ) ) 
                          GROUP BY b.ITC_PERIOD
                     )
                     c ON a.ITC_PERIOD = c.ITC_PERIOD
                     LEFT JOIN
                     (
                         SELECT ITC_PERIOD,
                                SUM(TAX_VALUE) AS CVAL
                           FROM ANX2_3AE e
                          WHERE FLG !='X' AND e.DOCTYPE = 'CN' AND 
                                (e.ACTION_TAKEN = 'R' OR 
                                 ( (e.ACTION_TAKEN = '' OR 
                                    e.ACTION_TAKEN IS NULL) AND 
                                   (e.PORTAL_STAT = 'R') ) ) 
                          GROUP BY e.ITC_PERIOD
                     )
                     d ON (a.ITC_PERIOD = d.ITC_PERIOD) 
                     LEFT JOIN
                     (
                         SELECT ITC_PERIOD,
                                SUM(IGST) AS IIGST,
                                SUM(CESS) AS ICESS
                           FROM ANX2_3AE
                          WHERE FLG !='X' AND (IS_ITC_ENTL NOT IN ('N', 'N/Y') AND 
                                 CLM_REF != 'Y') AND 
                                DOCTYPE IN ('I', 'DN') AND 
                                (ACTION_TAKEN = 'R' OR 
                                 ( (ACTION_TAKEN = '' OR 
                                    ACTION_TAKEN IS NULL) AND 
                                   (PORTAL_STAT = 'R') ) ) 
                          GROUP BY ITC_PERIOD
                     )
                     f ON a.ITC_PERIOD = f.ITC_PERIOD
                     LEFT JOIN
                     (
                         SELECT ITC_PERIOD,
                                SUM(IGST) AS CIGST,
                                SUM(CESS) AS CCESS
                           FROM ANX2_3AE
                          WHERE FLG !='X' AND (IS_ITC_ENTL NOT IN ('N', 'N/Y') AND 
                                 CLM_REF != 'Y') AND 
                                DOCTYPE = 'CN' AND 
                                (ACTION_TAKEN = 'R' OR 
                                 ( (ACTION_TAKEN = '' OR 
                                    ACTION_TAKEN IS NULL) AND 
                                   (PORTAL_STAT = 'R') ) ) 
                          GROUP BY ITC_PERIOD
                     )
                     g ON a.ITC_PERIOD = g.ITC_PERIOD;`,

       summpending:
            `CREATE VIEW ANX2_3E_DSUMM_P AS
                     SELECT a.COUNT AS count,
                            (IFNULL(c.IDVAL, 0) - IFNULL(d.CVAL, 0) ) AS taxval,
                            (IFNULL(f.IIGST, 0) - IFNULL(g.CIGST, 0) ) AS igst,
                            (IFNULL(f.ICESS, 0) - IFNULL(g.CCESS, 0) ) AS cess,
                            a.ITC_PERIOD
                       FROM (
                                SELECT ITC_PERIOD,
                                       count(1) AS COUNT
                                  FROM ANX2_3AE
                                 WHERE FLG !='X' AND (ACTION_TAKEN = 'P' OR 
                                        ( (ACTION_TAKEN = '' OR 
                                           ACTION_TAKEN IS NULL) AND 
                                          (PORTAL_STAT = 'P') ) OR 
                                        (S_RETURN_STAT = 'NF (ITC-NA)' AND 
                                         ( (ACTION_TAKEN IN ('', 'S') OR 
                                            ACTION_TAKEN IS NULL) AND 
                                           (PORTAL_STAT IN ('A', '') OR 
                                            PORTAL_STAT IS NULL) ) ) ) 
                                 GROUP BY ITC_PERIOD
                            )
                            a
                            LEFT JOIN
                            (
                                SELECT ITC_PERIOD,
                                       SUM(TAX_VALUE) AS IDVAL
                                  FROM ANX2_3AE b
                                 WHERE FLG !='X' AND b.DOCTYPE IN ('I', 'DN') AND 
                                       (b.ACTION_TAKEN = 'P' OR 
                                        ( (b.ACTION_TAKEN = '' OR 
                                           b.ACTION_TAKEN IS NULL) AND 
                                          (b.PORTAL_STAT = 'P') ) OR 
                                        (b.S_RETURN_STAT = 'NF (ITC-NA)' AND 
                                         ( (b.ACTION_TAKEN IN ('', 'S') OR 
                                            b.ACTION_TAKEN IS NULL) AND 
                                           (b.PORTAL_STAT IN ('A', '') OR 
                                            b.PORTAL_STAT IS NULL) ) ) ) 
                                 GROUP BY b.ITC_PERIOD
                            )
                            c ON a.ITC_PERIOD = c.ITC_PERIOD
                            LEFT JOIN
                            (
                                SELECT ITC_PERIOD,
                                       SUM(TAX_VALUE) AS CVAL
                                  FROM ANX2_3AE e
                                 WHERE FLG !='X' AND e.DOCTYPE = 'CN' AND 
                                       (e.ACTION_TAKEN = 'P' OR 
                                        ( (e.ACTION_TAKEN = '' OR 
                                           e.ACTION_TAKEN IS NULL) AND 
                                          (e.PORTAL_STAT = 'P') ) OR 
                                        (e.S_RETURN_STAT = 'NF (ITC-NA)' AND 
                                         ( (e.ACTION_TAKEN IN ('', 'S') OR 
                                            e.ACTION_TAKEN IS NULL) AND 
                                           (e.PORTAL_STAT IN ('A', '') OR 
                                            e.PORTAL_STAT IS NULL) ) ) ) 
                                 GROUP BY e.ITC_PERIOD
                            )
                            d ON (a.ITC_PERIOD = d.ITC_PERIOD) 
                            LEFT JOIN
                            (
                                SELECT ITC_PERIOD,
                                       SUM(IGST) AS IIGST,
                                       SUM(CESS) AS ICESS
                                  FROM ANX2_3AE
                                 WHERE FLG !='X' AND (IS_ITC_ENTL NOT IN ('N', 'N/Y') AND 
                                        CLM_REF != 'Y') AND 
                                       DOCTYPE IN ('I', 'DN') AND 
                                       (ACTION_TAKEN = 'P' OR 
                                        ( (ACTION_TAKEN = '' OR 
                                           ACTION_TAKEN IS NULL) AND 
                                          (PORTAL_STAT = 'P') ) OR 
                                        (S_RETURN_STAT = 'NF (ITC-NA)' AND 
                                         ( (ACTION_TAKEN IN ('', 'S') OR 
                                            ACTION_TAKEN IS NULL) AND 
                                           (PORTAL_STAT IN ('A', '') OR 
                                            PORTAL_STAT IS NULL) ) ) ) 
                                 GROUP BY ITC_PERIOD
                            )
                            f ON a.ITC_PERIOD = f.ITC_PERIOD
                            LEFT JOIN
                            (
                                SELECT ITC_PERIOD,
                                       SUM(IGST) AS CIGST,
                                       SUM(CESS) AS CCESS
                                  FROM ANX2_3AE
                                 WHERE FLG !='X' AND (IS_ITC_ENTL NOT IN ('N', 'N/Y') AND 
                                        CLM_REF != 'Y') AND 
                                       DOCTYPE = 'CN' AND 
                                       (ACTION_TAKEN = 'P' OR 
                                        ( (ACTION_TAKEN = '' OR 
                                           ACTION_TAKEN IS NULL) AND 
                                          (PORTAL_STAT = 'P') ) OR 
                                        (S_RETURN_STAT = 'NF (ITC-NA)' AND 
                                         ( (ACTION_TAKEN IN ('', 'S') OR 
                                            ACTION_TAKEN IS NULL) AND 
                                           (PORTAL_STAT IN ('A', '') OR 
                                            PORTAL_STAT IS NULL) ) ) ) 
                                 GROUP BY ITC_PERIOD
                            )
                            g ON a.ITC_PERIOD = g.ITC_PERIOD;`,


        erraccept:`CREATE VIEW ANX2_3E_ERR_SUMM_A AS
            SELECT a.STIN,
                   a.TRDNAME,
                   a.ACOUNT,
                   (IFNULL(c.IDAMT, 0) - IFNULL(d.CAMT, 0) ) AS ATAXAMT,
                   (IFNULL(e.AECOUNT, 0) ) AS AECOUNT,
                   a.ITC_PERIOD AS AITC
              FROM (
                       SELECT STIN,
                              TRDNAME,
                              ITC_PERIOD,
                              count(1) AS ACOUNT
                         FROM ANX2_3AE
                        WHERE (FLG = 'X' OR 
                               ERROR_CODE IS NOT NULL) AND 
                              S_RETURN_STAT != 'NF (ITC-NA)' AND 
                              (ACTION_TAKEN = 'A' OR 
                               ( (ACTION_TAKEN IN ('', 'S') OR 
                                  ACTION_TAKEN IS NULL) AND 
                                 (PORTAL_STAT IN ('A', '') OR 
                                  PORTAL_STAT IS NULL) ) OR 
                               (ACTION_TAKEN = 'S' AND 
                                PORTAL_STAT IN ('P', 'R') ) ) 
                        GROUP BY STIN,
                                 ITC_PERIOD
                   )
                   a
                   LEFT JOIN
                   (
                       SELECT STIN,
                              ITC_PERIOD,
                              sum(b.igst + b.cess) AS IDAMT
                         FROM ANX2_3AE b
                        WHERE (FLG = 'X' OR 
                               ERROR_CODE IS NOT NULL) AND 
                              (b.S_RETURN_STAT != 'NF (ITC-NA)' AND 
                               b.IS_ITC_ENTL NOT IN ('N', 'N/Y') AND 
                               b.CLM_REF != 'Y') AND 
                              b.DOCTYPE IN ('I', 'DN') AND 
                              (b.ACTION_TAKEN = 'A' OR 
                               ( (b.ACTION_TAKEN IN ('', 'S') OR 
                                  b.ACTION_TAKEN IS NULL) AND 
                                 (b.PORTAL_STAT IN ('A', '') OR 
                                  b.PORTAL_STAT IS NULL) ) OR 
                               (b.ACTION_TAKEN = 'S' AND 
                                b.PORTAL_STAT IN ('P', 'R') ) ) 
                        GROUP BY b.STIN,
                                 b.ITC_PERIOD
                   )
                   c ON a.STIN = c.STIN AND 
                        a.ITC_PERIOD = c.ITC_PERIOD
                   LEFT JOIN
                   (
                       SELECT STIN,
                              ITC_PERIOD,
                              sum(e.igst + e.cess) AS CAMT
                         FROM ANX2_3AE e
                        WHERE (FLG = 'X' OR 
                               ERROR_CODE IS NOT NULL) AND 
                              (e.S_RETURN_STAT != 'NF (ITC-NA)' AND 
                               e.IS_ITC_ENTL NOT IN ('N', 'N/Y') AND 
                               e.CLM_REF != 'Y') AND 
                              e.DOCTYPE = 'CN' AND 
                              (e.ACTION_TAKEN = 'A' OR 
                               ( (e.ACTION_TAKEN IN ('', 'S') OR 
                                  e.ACTION_TAKEN IS NULL) AND 
                                 (e.PORTAL_STAT IN ('A', '') OR 
                                  e.PORTAL_STAT IS NULL) ) OR 
                               (e.ACTION_TAKEN = 'S' AND 
                                e.PORTAL_STAT IN ('P', 'R') ) ) 
                        GROUP BY e.STIN,
                                 e.ITC_PERIOD
                   )
                   d ON (a.STIN = d.STIN AND 
                         a.ITC_PERIOD = d.ITC_PERIOD) 
                   LEFT JOIN
                   (
                       SELECT STIN,
                              TRDNAME,
                              ITC_PERIOD,
                              count(1) AS AECOUNT
                         FROM ANX2_3AE
                        WHERE FLG = 'X' AND 
                              S_RETURN_STAT != 'NF (ITC-NA)' AND 
                              (ACTION_TAKEN = 'A' OR 
                               ( (ACTION_TAKEN IN ('', 'S') OR 
                                  ACTION_TAKEN IS NULL) AND 
                                 (PORTAL_STAT IN ('A', '') OR 
                                  PORTAL_STAT IS NULL) ) OR 
                               (ACTION_TAKEN = 'S' AND 
                                PORTAL_STAT IN ('P', 'R') ) ) 
                        GROUP BY STIN,
                                 ITC_PERIOD
                   )
                   e ON (a.STIN = e.STIN AND 
                         a.ITC_PERIOD = e.ITC_PERIOD) 
             ORDER BY a.STIN;`,

        errpending:`CREATE VIEW ANX2_3E_ERR_SUMM_P AS
            SELECT a.STIN,
                   a.TRDNAME,
                   a.PCOUNT,
                   (IFNULL(c.IDAMT, 0) - IFNULL(d.CAMT, 0) ) AS PTAXAMT,
                   (IFNULL(e.PECOUNT, 0) ) AS PECOUNT,
                   a.ITC_PERIOD AS PITC
              FROM (
                       SELECT STIN,
                              TRDNAME,
                              ITC_PERIOD,
                              count(1) AS PCOUNT
                         FROM ANX2_3AE
                        WHERE (FLG = 'X' OR 
                               ERROR_CODE IS NOT NULL) AND 
                              (ACTION_TAKEN = 'P' OR 
                               ( (ACTION_TAKEN = '' OR 
                                  ACTION_TAKEN IS NULL) AND 
                                 (PORTAL_STAT = 'P') ) OR 
                               (S_RETURN_STAT = 'NF (ITC-NA)' AND 
                                ( (ACTION_TAKEN IN ('', 'S') OR 
                                   ACTION_TAKEN IS NULL) AND 
                                  (PORTAL_STAT IN ('A', '') OR 
                                   PORTAL_STAT IS NULL) ) ) ) 
                        GROUP BY STIN,
                                 ITC_PERIOD
                   )
                   a
                   LEFT JOIN
                   (
                       SELECT b.STIN,
                              b.ITC_PERIOD,
                              sum(b.igst + b.cess) AS IDAMT
                         FROM ANX2_3AE b
                        WHERE (FLG = 'X' OR 
                               ERROR_CODE IS NOT NULL) AND 
                              (b.IS_ITC_ENTL NOT IN ('N', 'N/Y') AND 
                               b.CLM_REF != 'Y') AND 
                              b.DOCTYPE IN ('I', 'DN') AND 
                              (b.ACTION_TAKEN = 'P' OR 
                               ( (b.ACTION_TAKEN = '' OR 
                                  b.ACTION_TAKEN IS NULL) AND 
                                 (b.PORTAL_STAT = 'P') ) OR 
                               (b.S_RETURN_STAT = 'NF (ITC-NA)' AND 
                                ( (b.ACTION_TAKEN IN ('', 'S') OR 
                                   b.ACTION_TAKEN IS NULL) AND 
                                  (b.PORTAL_STAT IN ('A', '') OR 
                                   b.PORTAL_STAT IS NULL) ) ) ) 
                        GROUP BY b.STIN,
                                 b.ITC_PERIOD
                   )
                   c ON a.STIN = c.STIN AND 
                        a.ITC_PERIOD = c.ITC_PERIOD
                   LEFT JOIN
                   (
                       SELECT e.STIN,
                              e.ITC_PERIOD,
                              sum(e.igst + e.cess) AS CAMT
                         FROM ANX2_3AE e
                        WHERE (FLG = 'X' OR 
                               ERROR_CODE IS NOT NULL) AND 
                              (e.IS_ITC_ENTL NOT IN ('N', 'N/Y') AND 
                               e.CLM_REF != 'Y') AND 
                              e.DOCTYPE = 'CN' AND 
                              (e.ACTION_TAKEN = 'P' OR 
                               ( (e.ACTION_TAKEN = '' OR 
                                  e.ACTION_TAKEN IS NULL) AND 
                                 (e.PORTAL_STAT = 'P') ) OR 
                               (e.S_RETURN_STAT = 'NF (ITC-NA)' AND 
                                ( (e.ACTION_TAKEN IN ('', 'S') OR 
                                   e.ACTION_TAKEN IS NULL) AND 
                                  (e.PORTAL_STAT IN ('A', '') OR 
                                   e.PORTAL_STAT IS NULL) ) ) ) 
                        GROUP BY e.STIN,
                                 e.ITC_PERIOD
                   )
                   d ON a.STIN = d.STIN AND 
                        a.ITC_PERIOD = d.ITC_PERIOD
                   LEFT JOIN
                   (
                       SELECT STIN,
                              TRDNAME,
                              ITC_PERIOD,
                              count(1) AS PECOUNT
                         FROM ANX2_3AE
                        WHERE FLG = 'X' AND 
                              (ACTION_TAKEN = 'P' OR 
                               ( (ACTION_TAKEN = '' OR 
                                  ACTION_TAKEN IS NULL) AND 
                                 (PORTAL_STAT = 'P') ) OR 
                               (S_RETURN_STAT = 'NF (ITC-NA)' AND 
                                ( (ACTION_TAKEN IN ('', 'S') OR 
                                   ACTION_TAKEN IS NULL) AND 
                                  (PORTAL_STAT IN ('A', '') OR 
                                   PORTAL_STAT IS NULL) ) ) ) 
                        GROUP BY STIN,
                                 ITC_PERIOD
                   )
                   e ON a.STIN = e.STIN AND 
                        a.ITC_PERIOD = e.ITC_PERIOD
             ORDER BY a.STIN;`,

        errreject:` CREATE VIEW ANX2_3E_ERR_SUMM_R AS
            SELECT a.STIN,
                   a.TRDNAME,
                   a.RCOUNT,
                   (IFNULL(c.IDAMT, 0) - IFNULL(d.CAMT, 0) ) AS RTAXAMT,
                   (IFNULL(e.RECOUNT, 0) ) AS RECOUNT,
                   a.ITC_PERIOD AS RITC
              FROM (
                       SELECT STIN,
                              TRDNAME,
                              ITC_PERIOD,
                              count(1) AS RCOUNT
                         FROM ANX2_3AE
                        WHERE (FLG = 'X' OR 
                               ERROR_CODE IS NOT NULL) AND 
                              (ACTION_TAKEN = 'R' OR 
                               ( (ACTION_TAKEN = '' OR 
                                  ACTION_TAKEN IS NULL) AND 
                                 (PORTAL_STAT = 'R') ) ) 
                        GROUP BY STIN,
                                 ITC_PERIOD
                   )
                   a
                   LEFT JOIN
                   (
                       SELECT STIN,
                              ITC_PERIOD,
                              sum(b.igst + b.cess) AS IDAMT
                         FROM ANX2_3AE b
                        WHERE (FLG = 'X' OR 
                               ERROR_CODE IS NOT NULL) AND 
                              (b.IS_ITC_ENTL NOT IN ('N', 'N/Y') AND 
                               b.CLM_REF != 'Y') AND 
                              b.DOCTYPE IN ('I', 'DN') AND 
                              (b.ACTION_TAKEN = 'R' OR 
                               ( (b.ACTION_TAKEN = '' OR 
                                  b.ACTION_TAKEN IS NULL) AND 
                                 (b.PORTAL_STAT = 'R') ) ) 
                        GROUP BY b.STIN,
                                 b.ITC_PERIOD
                   )
                   c ON a.STIN = c.STIN AND 
                        a.ITC_PERIOD = c.ITC_PERIOD
                   LEFT JOIN
                   (
                       SELECT e.STIN,
                              e.ITC_PERIOD,
                              sum(e.igst + e.cess) AS CAMT
                         FROM ANX2_3AE e
                        WHERE (FLG = 'X' OR 
                               ERROR_CODE IS NOT NULL) AND 
                              (e.IS_ITC_ENTL NOT IN ('N', 'N/Y') AND 
                               e.CLM_REF != 'Y') AND 
                              e.DOCTYPE = 'CN' AND 
                              (e.ACTION_TAKEN = 'R' OR 
                               ( (e.ACTION_TAKEN = '' OR 
                                  e.ACTION_TAKEN IS NULL) AND 
                                 (e.PORTAL_STAT = 'R') ) ) 
                        GROUP BY e.STIN,
                                 e.ITC_PERIOD
                   )
                   d ON a.STIN = d.STIN AND 
                        a.ITC_PERIOD = d.ITC_PERIOD
                   LEFT JOIN
                   (
                       SELECT STIN,
                              TRDNAME,
                              ITC_PERIOD,
                              count(1) AS RECOUNT
                         FROM ANX2_3AE
                        WHERE FLG = 'X' AND 
                              (ACTION_TAKEN = 'R' OR 
                               ( (ACTION_TAKEN = '' OR 
                                  ACTION_TAKEN IS NULL) AND 
                                 (PORTAL_STAT = 'R') ) ) 
                        GROUP BY STIN,
                                 ITC_PERIOD
                   )
                   e ON (a.STIN = e.STIN AND 
                         a.ITC_PERIOD = e.ITC_PERIOD) 
             ORDER BY a.STIN;`

}

const sezwop = {

         erraccept:`CREATE VIEW ANX2_3F_ERR_SUMM_A AS
         SELECT a.STIN,
                a.TRDNAME,
                a.ACOUNT,
                (IFNULL(b.AECOUNT, 0) ) AS AECOUNT,
                a.AITC
           FROM (
                    SELECT STIN,
                           TRDNAME,
                           ITC_PERIOD AS AITC,
                           count(1) AS ACOUNT
                      FROM ANX2_3AF
                     WHERE (FLG = 'X' OR 
                            ERROR_CODE IS NOT NULL) AND 
                           S_RETURN_STAT != 'NF (ITC-NA)' AND 
                           (ACTION_TAKEN = 'A' OR 
                            ( (ACTION_TAKEN IN ('', 'S') OR 
                               ACTION_TAKEN IS NULL) AND 
                              (PORTAL_STAT IN ('A', '') OR 
                               PORTAL_STAT IS NULL) ) OR 
                            (ACTION_TAKEN = 'S' AND 
                             PORTAL_STAT IN ('P', 'R') ) ) 
                     GROUP BY STIN,
                              ITC_PERIOD
                )
                a
                LEFT JOIN
                (
                    SELECT STIN,
                           TRDNAME,
                           ITC_PERIOD AS AITC,
                           count(1) AS AECOUNT
                      FROM ANX2_3AF
                     WHERE FLG = 'X' AND 
                           S_RETURN_STAT != 'NF (ITC-NA)' AND 
                           (ACTION_TAKEN = 'A' OR 
                            ( (ACTION_TAKEN IN ('', 'S') OR 
                               ACTION_TAKEN IS NULL) AND 
                              (PORTAL_STAT IN ('A', '') OR 
                               PORTAL_STAT IS NULL) ) OR 
                            (ACTION_TAKEN = 'S' AND 
                             PORTAL_STAT IN ('P', 'R') ) ) 
                     GROUP BY STIN,
                              ITC_PERIOD
                )
                b ON a.STIN = b.STIN AND 
                     a.AITC = b.AITC
          ORDER BY a.STIN;`,
 
         errpending:`CREATE VIEW ANX2_3F_ERR_SUMM_P AS
         SELECT a.STIN,
                a.TRDNAME,
                a.PCOUNT,
                (IFNULL(b.PECOUNT, 0) ) AS PECOUNT,
                a.PITC
           FROM (
                    SELECT STIN,
                           TRDNAME,
                           ITC_PERIOD AS PITC,
                           count(1) AS PCOUNT
                      FROM ANX2_3AF
                     WHERE (FLG = 'X' OR 
                            ERROR_CODE IS NOT NULL) AND 
                           (ACTION_TAKEN = 'P' OR 
                            ( (ACTION_TAKEN = '' OR 
                               ACTION_TAKEN IS NULL) AND 
                              (PORTAL_STAT = 'P') ) OR 
                            (S_RETURN_STAT = 'NF (ITC-NA)' AND 
                             ( (ACTION_TAKEN IN ('', 'S') OR 
                                ACTION_TAKEN IS NULL) AND 
                               (PORTAL_STAT IN ('A', '') OR 
                                PORTAL_STAT IS NULL) ) ) ) 
                     GROUP BY STIN,
                              ITC_PERIOD
                )
                a
                LEFT JOIN
                (
                    SELECT STIN,
                           TRDNAME,
                           ITC_PERIOD AS PITC,
                           count(1) AS PECOUNT
                      FROM ANX2_3AF
                     WHERE FLG = 'X' AND 
                           (ACTION_TAKEN = 'P' OR 
                            ( (ACTION_TAKEN = '' OR 
                               ACTION_TAKEN IS NULL) AND 
                              (PORTAL_STAT = 'P') ) OR 
                            (S_RETURN_STAT = 'NF (ITC-NA)' AND 
                             ( (ACTION_TAKEN IN ('', 'S') OR 
                                ACTION_TAKEN IS NULL) AND 
                               (PORTAL_STAT IN ('A', '') OR 
                                PORTAL_STAT IS NULL) ) ) ) 
                     GROUP BY STIN,
                              ITC_PERIOD
                )
                b ON a.STIN = b.STIN AND 
                     a.PITC = b.PITC
          ORDER BY a.STIN;`,
 
         errreject:`CREATE VIEW ANX2_3F_ERR_SUMM_R AS
         SELECT a.STIN,
                a.TRDNAME,
                a.RCOUNT,
                (IFNULL(b.RECOUNT, 0) ) AS RECOUNT,
                a.RITC
           FROM (
                    SELECT STIN,
                           TRDNAME,
                           ITC_PERIOD AS RITC,
                           count(1) AS RCOUNT
                      FROM ANX2_3AF
                     WHERE (FLG = 'X' OR 
                            ERROR_CODE IS NOT NULL) AND 
                           (ACTION_TAKEN = 'R' OR 
                            ( (ACTION_TAKEN = '' OR 
                               ACTION_TAKEN IS NULL) AND 
                              (PORTAL_STAT = 'R') ) ) 
                     GROUP BY STIN,
                              ITC_PERIOD
                )
                a
                LEFT JOIN
                (
                    SELECT STIN,
                           TRDNAME,
                           ITC_PERIOD AS RITC,
                           count(1) AS RECOUNT
                      FROM ANX2_3AF
                     WHERE FLG = 'X' AND 
                           (ACTION_TAKEN = 'R' OR 
                            ( (ACTION_TAKEN = '' OR 
                               ACTION_TAKEN IS NULL) AND 
                              (PORTAL_STAT = 'R') ) ) 
                     GROUP BY STIN,
                              ITC_PERIOD
                )
                b ON a.STIN = b.STIN AND 
                     a.RITC = b.RITC
          ORDER BY a.STIN;`
 
 }

module.exports = {
     b2b: b2b,
     de: de,
     sezwp: sezwp,
     sezwop:sezwop

}