class CreateMessages < ActiveRecord::Migration[7.2]
  def change
    create_table :messages do |t|
      t.text :subject

      t.timestamps
    end
  end
end
