from django.db import migrations

# Approved editorial copy. Match public record UUIDs; do not alter CV source fields.
COPY = [('Education',
  '8cd1f43a-298d-41e3-9732-ef2c921c81c3',
  {'timeline_summary': 'Bibliographic study of automotive centrifugal turbocharger performance, '
                       'focusing on non-adiabatic conditions. Analyzed an experimental test bench '
                       'for the effect of heat exchange on compression performance and proposed an '
                       'improved experimental design.',
   'narrative_heading': 'Engineering foundations',
   'narrative_body': 'Learning how complex systems behave.'}),
 ('Experience',
  '4b85b608-14b7-48ac-8cf0-c1878377e61e',
  {'timeline_summary': '- Tested material resistance, applied metrology and statistics to the '
                       'production cycle, analyzed CAD models to keep engine-head tolerances below '
                       '0.1 mm, and evaluated SDAS to assess alloy fatigue performance.'}),
 ('Education',
  '1ca49afa-565d-4677-9e24-63fcb67d5b48',
  {'timeline_summary': 'Production and Conversion of Energy track. Final grade: 110/110 (96.4th '
                       'percentile).\n'
                       '\n'
                       'The thesis article was published in *MDPI Energies* on January 29, 2022.',
   'transition_motif': 'breakthrough'}),
 ('Experience',
  'cc62600b-5516-4026-bba3-c11762a4de61',
  {'timeline_summary': '- Developed a greedy-indexing heuristic Monte Carlo simulation in MATLAB '
                       'to assess the feasibility of virtual power plant participation in the '
                       'ancillary-services market using data from two operating Enel CHP plants.',
   'transition_motif': 'detour'}),
 ('Experience',
  '1510dc6e-7058-4328-9bec-8b9ff29af70e',
  {'timeline_summary': '- Orchestrated four Supercharger deployments from negotiation and '
                       'permitting through design, construction, and commissioning.\n'
                       '- Established a wall-connector installer network with nationwide '
                       'coverage.\n'
                       '- Became the first intern to draft, negotiate, and execute a Supercharger '
                       'agreement with a local landlord.',
   'narrative_heading': 'From systems to delivery',
   'narrative_body': 'Turning technical understanding into work in the field.'}),
 ('Experience',
  '30a6f7c2-d2bb-41f4-a346-99c30b9d8856',
  {'timeline_summary': "- Championed Tesla Energy's entry into the Italian solar market, "
                       'negotiating a nationwide framework agreement for photovoltaic and '
                       'battery-storage installations.\n'
                       '- Implemented process improvements and automation scripts for EMEA Energy '
                       'Business Operations, achieving savings worth more than $300k per year.'}),
 ('Experience',
  '9a7db354-b44c-47c6-afb6-ab969d56dc35',
  {'timeline_summary': '- Directed global cross-functional improvements to Tesla Energy billing, '
                       'pricing, and automation systems, enabling upwards of $10M in annualized '
                       'efficiency gains and sales.\n'
                       "- Led the billing integration's move from a monolith to a "
                       'microservice-based architecture as de-facto Product Manager, delivering '
                       'efficiencies worth 15 FTE.\n'
                       '- Implemented tiered pricing in the B2B e-commerce storefront, enabling '
                       'new business models and pricing strategies.\n'
                       '- Drove Tesla Energy requirements during the global migration from '
                       'Salesforce to an in-house CRM, helping deliver yearly savings exceeding '
                       '$20M without disrupting operations.\n'
                       '- Built and deployed a CRM-integrated tool for configuring and quoting '
                       'custom Megapack sites, saving more than 500 account-manager hours per '
                       'quarter.'}),
 ('Experience',
  '78b683f1-0746-4b0e-b95f-21ec1f6cadfc',
  {'timeline_summary': '- Owned the vision and strategy for EMEA billing and global e-invoicing '
                       'systems. Reduced invoice redraws and improved first-time-right billing by '
                       'more than 40%.\n'
                       '- Designed and launched a scalable framework for accounting and tax '
                       'reports, enabling rapid compliance in new markets and saving upwards of '
                       '$1M per year in manual-submission consulting costs.\n'
                       '- Overhauled the e-invoicing system and closed the feedback loop with '
                       'users, increasing compliance from below 60% to approximately 100% in key '
                       'markets.',
   'narrative_heading': 'From delivery to product leadership',
   'narrative_body': 'Growing the scope from individual systems to products and people.'}),
 ('Experience',
  'a14850e8-bf97-42fe-b35e-ec2fdcbeb183',
  {'timeline_summary': '- Recruit, mentor, and set the strategic and technical direction for a '
                       'team of 7+ Product Managers overseeing billing systems and automation '
                       'platforms.\n'
                       '- Devised the product-portfolio vision for complex EMEA markets and '
                       'integrations with local governments, entering eight new markets and '
                       'enabling billing for four new product lines.\n'
                       '- Designed and built a vehicle-registration platform from the ground up. '
                       'Its French and German authority integrations save upwards of 34 FTE.'})]


def seed(apps, schema_editor):
    for model_name, uuid, fields in COPY:
        model = apps.get_model('resume', model_name)
        for field, value in fields.items():
            empty = 'none' if field == 'transition_motif' else ''
            model.objects.filter(uuid=uuid, **{field: empty}).update(**{field: value})


def unseed(apps, schema_editor):
    for model_name, uuid, fields in COPY:
        model = apps.get_model('resume', model_name)
        for field, value in fields.items():
            empty = 'none' if field == 'transition_motif' else ''
            model.objects.filter(uuid=uuid, **{field: value}).update(**{field: empty})


class Migration(migrations.Migration):
    dependencies = [('resume', '0013_education_narrative_body_education_narrative_heading_and_more')]
    operations = [migrations.RunPython(seed, unseed)]
