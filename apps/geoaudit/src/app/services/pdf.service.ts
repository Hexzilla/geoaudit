import { Injectable } from '@angular/core';
import { Survey, Testpost, Tr, TpAction, TrAction } from '../models';

@Injectable({ providedIn: 'root' })
export class PdfService {
    
  getPrintData(survey: Survey) {
    const sites = [];
    const testposts = Array<Testpost>();
    const trs = Array<Tr>();
    const tp_actions = Array<TpAction>();
    const tr_actions = Array<TrAction>();

    return {
      content: [
        {
          image: 'sampleImage.jpg',
          width: 200,
        },
        //Survey general details
        {
          text: `Survey ${survey.reference} - ${survey.name}`,
          style: 'header',
        },
        'This reposrt has been produced .... All the information are private and confidential, reserved to XXXXLtd',
        {
          text: 'Overview',
          style: 'subheader',
        },
        {
          style: 'tableExample',
          table: {
            widths: [120, '*'],
            body: [
              ['Job', survey.job?.reference],
              ['Reference', survey.reference],
              ['Name', survey.name],
              ['Status', survey.status.name],
              ['Location', `${survey.geometry['lat']} ${survey.geometry['lng']}`],
            ],
          },
        },
        {
          style: 'tableExample',
          table: {
            widths: [120, '*'],
            body: [
              ['Date Assigned', survey.date_assigned],
              ['Date Delivery', survey.date_delivery],
              ['Prepared By', survey.prepared_by],
              ['Conducted By', survey.conducted_by],
            ],
          },
        },
        {
          text: 'Supportive documentation',
          style: 'subheader',
        },
        //SPACE FOR ATTACHEMENTS/images
        {
          style: 'tableExample',
          table: {
            widths: [120, '*'],
            body: [
              [{ text: 'Images\n', bold: true, colSpan: 2 }, ''],
              survey.images?.map(it => it.url)
            ],
          },
        },
        {
          style: 'tableExample',
          table: {
            widths: [120, '*'],
            body: [
              [{ text: 'Documents\n', bold: true, colSpan: 2 }, ''],
              survey.documents?.map(it => it.url)
            ],
          },
        },
        {
          style: 'tableExample',
          table: {
            widths: [120, '*'],
            body: [
              [{ text: 'Notes\n', bold: true, colSpan: 2 }, ''],
              survey.notes?.map(note => {
                return [note.datetime, note.description];
              })
            ],
          },
        },

        //Survey Details
        { text: 'Survey Details ', style: 'header', pageBreak: 'before' },
        'This section gathers the survey information collected in field.',
        //Site Details
        //List
        { text: 'Site Details', style: 'subheader' },
        'This section includes the following sites',
        {
          ul: sites.map(site => `site ${site.name}`)
        },

        //home/site_details/:id
        {
          text: 'Site <name>',
          style: 'subheader',
          fontSize: 12,
          italics: true,
        },
        //Tab Properties
        {
          style: 'tableExample',
          table: {
            widths: [120, '*'],
            body: [
              [{ text: 'Properties\n', bold: true, colSpan: 2 }, ''],
              ['Reference', '<reference>'],
              ['Name', '<name>'],
              ['Date Installation', '<date_installation>'],
              ['Region', '<reference>'],
              ['Reference', '<region>'],
              ['Address', '<address>'],
              ['Scheme', '<scheme>'],
              ['Site Type', '<site_type.name>'],
            ],
          },
        },
        //Tab TM
        {
          style: 'tableExample',
          table: {
            widths: [120, '*'],
            body: [
              [{ text: 'Traffic Management\n', bold: true, colSpan: 2 }, ''],
              ['Owner', '<owner>'],
              ['Access', '<access_detail>'],
              ['Speed Limit', '<speed_limit>'],
              ['Distance from road', '<distance_road>'],
              ['Road condition', '<road_condition>'],
              ['TM required?', '<tm_required>'],
              ['TM description', '<tm_descr>'],
              ['NRSWA required?', '<nrswa_required>'],
              ['NRSWA description', '<nrswa_description>'],
            ],
          },
        },
        //Tab H&S
        {
          style: 'tableExample',
          table: {
            widths: [120, '*'],
            body: [
              [{ text: 'Health & Safety\n', bold: true, colSpan: 2 }, ''],
              ['Toilet Address', '<toilet>'],
              ['Hospital Address', '<hospital>'],
              ['Hazards', '<list of selected hazard.name>'],
            ],
          },
        },

        //////////////////////////////////////////////////////////////////////////////////////////
        //Testposts
        { text: 'Testposts', style: 'subheader', pageBreak: 'before' },
        'This section includes the following testposts',
        {
          ul: testposts?.map(it => `Testpost ${it.name} - <date>`)
        },

        //home/testpost/:id/tp_action/:id
        ...testposts?.reduce((prev, tp) => {
          return prev.concat(this.getTpActions(tp, tp_actions));
        }, []),

        //Trs
        {
          text: 'Transformer Rectifiers (Trs)',
          style: 'subheader',
          pageBreak: 'before',
        },
        'This section includes the following TRs',
        {
          ul: trs?.map(it => `TR ${it.name} - <date>`)
        },

        //home/trs/:id/tr_action/:id
        ...trs?.reduce((prev, tr) => {
          return prev.concat(this.getTrActions(tr, tr_actions));
        }, []),

        

        //Abriox
        { text: 'Abriox', style: 'subheader', pageBreak: 'before' },
        'This section includes the following abrioxes',
        {
          ul: [
            'Abriox <name> - <date>',
            'Abriox <name> - <date>',
            'Abriox <name> - <date>',
          ],
        },

        //home/abriox/:id/abriox_action/:id
        {
          text: 'Abriox <name>',
          style: 'subheader',
          fontSize: 12,
          italics: true,
        },
        {
          style: 'tableExample',
          table: {
            widths: [120, '*'],
            body: [
              ['Date Inspection', '<date>'],
              ['Condition', '<condition.name>'],
            ],
          },
        },

        //ABriox Details
        {
          style: 'tableExample',
          table: {
            widths: [120, '*'],
            body: [
              [{ text: 'Details', bold: true, colSpan: 2 }, ''],
              ['telephone', '<telephone>'],
              ['serial_number', '<serial_number>'],
              ['serial_number', '<serial_number>'],
              ['date_installation', '<date_installation>'],
              ['tr', '<tr>'],
              ['testpost', '<testpost>'],
            ],
          },
        },

        {
          style: 'tableExample',
          table: {
            widths: ['*'],
            body: [[{ text: 'Comments', bold: true }], ['<comment>']],
          },
        },

        {
          style: 'tableExample',
          table: {
            widths: ['*'],
            body: [
              [{ text: 'Images', bold: true }],
              [{ image: 'sampleImage.jpg', width: 250 }],
              [{ image: 'sampleImage.jpg', width: 250 }],
            ],
          },
        },
        {
          style: 'tableExample',
          table: {
            widths: ['*'],
            body: [
              [{ text: 'Documents', bold: true }],
              [{ image: 'sampleImage.jpg', width: 250 }],
              [{ image: 'sampleImage.jpg', width: 250 }],
            ],
          },
        },

        //Resistivities
        { text: 'Resistivity', style: 'subheader', pageBreak: 'before' },
        {
          style: 'tableExample',
          table: {
            widths: [120, '*'],
            body: [
              [
                { text: 'Resistivity <reference> \n', bold: true, colSpan: 2 },
                '',
              ],
              ['Date', '<date>'],
              ['Location', '<lat>, <lng>'],
              ['<distance>', '<value>'],
              ['<distance>', '<value>'],
              ['<distance>', '<value>'],
            ],
          },
        },

        {
          style: 'tableExample',
          table: {
            widths: ['*'],
            body: [[{ text: 'Comments', bold: true }], ['<comment>']],
          },
        },

        {
          style: 'tableExample',
          table: {
            widths: ['*'],
            body: [
              [{ text: 'Images', bold: true }],
              [{ image: 'sampleImage.jpg', width: 250 }],
              [{ image: 'sampleImage.jpg', width: 250 }],
            ],
          },
        },
        {
          style: 'tableExample',
          table: {
            widths: ['*'],
            body: [
              [{ text: 'Documents', bold: true }],
              [{ image: 'sampleImage.jpg', width: 250 }],
              [{ image: 'sampleImage.jpg', width: 250 }],
            ],
          },
        },

        //Completion
        { text: 'Completion', style: 'subheader' },
        'By providing my signature, I confirm and acknowledge that the information given in this form is true, complete and accurate',
        {
          style: 'tableExample',
          table: {
            widths: [120, '*'],
            body: [
              [{ text: 'Signed By\n', bold: true, colSpan: 2 }, ''],
              ['<approved_by>', 'IMAGE OF SIGNATURE'],
            ],
          },
        },
      ],
      styles: {
        header: {
          fontSize: 18,
          bold: true,
          margin: [0, 0, 0, 10],
        },
        subheader: {
          fontSize: 16,
          bold: true,
          margin: [0, 10, 0, 5],
        },
        tableExample: {
          margin: [0, 5, 0, 15],
        },
        tableHeader: {
          bold: true,
          fontSize: 13,
          color: 'black',
        },
      },
      defaultStyle: {
        // alignment: 'justify'
      },
    };
  }

  getTpActions(testpost: Testpost, tp_actions: Array<TpAction>) {
    return tp_actions
        .filter(it => it.testpost?.id == testpost.id)
        .reduce((previous, current) => {
          const detail = this.getTpActionDetail(testpost, current);
          return previous.concat(detail);
        }, []);
  }

  getTpActionDetail(testpost: Testpost, tp_action: TpAction) {
    return [
      {
        text: `Testpost ${testpost.name}`,
        style: 'subheader',
        fontSize: 12,
        italics: true,
      },
      {
        style: 'tableExample',
        table: {
          widths: [120, '*'],
          body: [
            ['Date Inspection', tp_action.date],
            ['Condition', tp_action.condition?.name],
          ],
        },
      },

      //Tab Readings
      {
        style: 'tableExample',
        table: {
          widths: [120, 30, 70, 30, 70, 30, '*'],
          body: [
            [
              { text: 'Readings\n', bold: true, colSpan: 7 },
              '',
              '',
              '',
              '',
              '',
              '',
            ],
            ['Pipe', 'ON', '', 'OFF', '', '', ''],
            [
              'Anodes',
              'ON',
              tp_action.tp_information?.anode_on,
              'OFF',
              tp_action.tp_information?.anodes_off,
              'I',
              tp_action.tp_information?.anodes_current,
            ],
          ],
        },
      },
      {
        style: 'tableExample',
        table: {
          widths: [120, 30, 70, 30, 70, 30, '*'],
          body: [
            [{ text: 'Groundbed', colSpan: 7 }, '', '', '', '', '', ''],
            ...tp_action.tp_information?.anode?.map((it, index) => [
              { text: `Anode ${index + 1}\n`, italics: true, colSpan: 3 },
              '',
              '',
              'OFF',
              it.anode_off,
              'I',
              it.anode_current,
            ]),
          ],
        },
      },
      {
        style: 'tableExample',
        table: {
          widths: [120, 30, 70, 30, 70, 30, '*'],
          body: [
            ...tp_action.tp_information?.dead?.map((it, index) => [
              { text: `Dead ${index + 1}`, italics: true },
              'ON',
              it.dead_on,
              'OFF',
              it.dead_off,
              'I',
              it.dead_current,
            ]),
          ],
        },
      },
      {
        style: 'tableExample',
        table: {
          widths: [120, 30, 70, 30, 70, 30, '*'],
          body: [
            ...tp_action.tp_information?.sleeve?.map((it, index) => [
              { text: `Sleeve ${index + 1}`, italics: true },
              'ON',
              it.sleeve_on,
              'OFF',
              it.sleeve_off,
              'I',
              it.sleeve_current,
            ]),
          ],
        },
      },
      {
        style: 'tableExample',
        table: {
          widths: [80, 30, 'auto', 30, 'auto', 30, 'auto', 30, '*'],
          body: [
            ...tp_action.tp_information?.coupon?.map((it, index) => [
              `Coupon ${index + 1}`,
              'ON',
              it.coupon_on,
              'OFF',
              it.coupon_off,
              'I-AC',
              it.coupon_current_ac,
              'I-DC',
              it.coupon_current_dc,
            ]),
          ],
        },
      },
      {
        style: 'tableExample',
        table: {
          widths: [120, 30, 70, 30, 70, 30, '*'],
          body: [
            [
              'Reed Switch',
              { text: `${tp_action.tp_information?.reedswitch_quantity || ''}\n`, colSpan: 6 },
              '',
              '',
              '',
              '',
              '',
            ],
            [
              'Reference cell',
              { text: `${tp_action.tp_information?.reference_cell?.name || ''}\n`, colSpan: 6 },
              '',
              '',
              '',
              '',
              '',
            ],
          ],
        },
      },

      //Tab Current Drain
      tp_action.current_drain?.map((it, index) => {
        return {
          style: 'tableExample',
          table: {
            widths: [120, 100, 120, '*'],
            body: [
              [{ text: `Current Drain ${index + 1}`, bold: true, colSpan: 4 }, '', '', ''],
              [
                'Input Potential',
                it.cd_input_v,
                'Input Current',
                it.cd_input_a,
              ],
              [
                'Output Potential',
                it.cd_output_v,
                'Outut Current',
                it.cd_output_a,
              ],
            ],
          },
        }
      }),

      //Tab Asset information
      {
        style: 'tableExample',
        table: {
          widths: [120, '*'],
          body: [
            [{ text: 'Asset information\n', bold: true, colSpan: 2 }, ''],
            ['Pipe depth', tp_action.pipe_depth],
            ['Reinstatement', tp_action.reinstatement],
          ],
        },
      },

      //Tab Fault details
      tp_action.fault_detail?.map((it, index) => {
        return {
          style: 'tableExample',
          table: {
            widths: [120, '*'],
            body: [
              [{ text: `Fault details ${index + 1}\n`, bold: true, colSpan: 2 }, ''],
              ['Fault Type', it.fault_type?.name || ''],
              ['Fault Description', it.fault_desc],
            ],
          },
        }
      }),

      {
        style: 'tableExample',
        table: {
          widths: ['*'],
          body: [[{ text: 'Comments', bold: true }], ['<comment>']],
        },
      },

      {
        style: 'tableExample',
        table: {
          widths: ['*'],
          body: [
            [{ text: 'Images', bold: true }],
            ...tp_action.images?.map(it => {
              return { image: it.url, width: 250 }
            }),
          ],
        },
      },
      {
        style: 'tableExample',
        table: {
          widths: ['*'],
          body: [
            [{ text: 'Documents', bold: true }],
            ...tp_action.documents?.map(it => {
              return { image: it.url, width: 250 }
            }),
          ],
        },
      },
    ];
  }

  getTrActions(tr: Tr, tr_actions: Array<TrAction>) {
    return tr_actions
        .filter(it => it.tr?.id == tr.id)
        .reduce((previous, current) => {
          const detail = this.getTrActionDetail(tr, current);
          return previous.concat(detail);
        }, []);
  }

  getTrActionDetail(tr: Tr, tr_action: TrAction) {
    return [
      { text: `TR ${tr.name}`, style: 'subheader', fontSize: 12, italics: true },
      {
        style: 'tableExample',
        table: {
          widths: [120, '*'],
          body: [
            ['Date Inspection', tr_action.date],
            ['Condition', tr_action.condition?.name || ''],
          ],
        },
      },

      //Tab Readings
      {
        style: 'tableExample',
        table: {
          widths: [120, 100, 120, '*'],
          body: [
            [{ text: 'Readings\n', bold: true, colSpan: 4 }, '', '', ''],
            ['Volt', tr_action.tr_readings?.Volt || '', 'Ampere', tr_action.tr_readings?.Amps || ''],
            [
              'Old Settings',
              { text: tr_action.tr_readings?.current_settings || '', colSpan: 3 },
              '',
              '',
            ],
          ],
        },
      },
      {
        style: 'tableExample',
        table: {
          widths: [120, 30, 70, 30, 70, 30, '*'],
          body: [
            [{ text: 'Groundbed', colSpan: 7 }, '', '', '', '', '', ''],
            ...tr_action.tr_readings?.groundbed?.map((it, index) => [
              { text: `Anode ${index + 1}\n`, italics: true, colSpan: 3 },
              '',
              '',
              'OFF',
              it.anode_off,
              'I',
              it.anode_current,
            ]),
          ],
        },
      },

      //Tab Current Drain
      tr_action.current_drain?.map((it, index) => {
        return {
          style: 'tableExample',
          table: {
            widths: [120, 100, 120, '*'],
            body: [
              [{ text: `Current Drain ${index + 1}`, bold: true, colSpan: 4 }, '', '', ''],
              [
                'Input Potential',
                it.cd_input_v,
                'Input Current',
                it.cd_input_a,
              ],
              [
                'Output Potential',
                it.cd_output_v,
                'Outut Current',
                it.cd_output_a,
              ],
            ],
          },
        }
      }),

      //Tab Fault details
      tr_action.fault_detail?.map((it, index) => {
        return {
          style: 'tableExample',
          table: {
            widths: [120, '*'],
            body: [
              [{ text: `Fault details ${index + 1}\n`, bold: true, colSpan: 2 }, ''],
              ['Fault Type', it.fault_type?.name || ''],
              ['Fault Description', it.fault_desc],
            ],
          },
        }
      }),

      {
        style: 'tableExample',
        table: {
          widths: ['*'],
          body: [
            [{ text: 'Comments', bold: true }],
            tr_action.comment
          ],
        },
      },

      {
        style: 'tableExample',
        table: {
          widths: ['*'],
          body: [
            [{ text: 'Images', bold: true }],
            ...tr_action.images?.map(it => {
              return { image: it.url, width: 250 }
            }),
          ],
        },
      },
      {
        style: 'tableExample',
        table: {
          widths: ['*'],
          body: [
            [{ text: 'Documents', bold: true }],
            ...tr_action.documents?.map(it => {
              return { image: it.url, width: 250 }
            }),
          ],
        },
      },
    ];
  }
}