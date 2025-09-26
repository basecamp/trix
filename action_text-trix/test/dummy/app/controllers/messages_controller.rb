class MessagesController < ApplicationController
  def index
    @messages = Message.all
  end

  def new
    @message = Message.new
  end

  def create
    @message = Message.create!(message_params)

    redirect_to action: :index
  end

  private
    def message_params
      if params.respond_to?(:expect)
        params.expect(message: [ :subject, :content ])
      else
        params.require(:message).permit(:subject, :content)
      end
    end
end
